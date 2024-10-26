/**
 * Teleprompter is a Cloudflare Worker and shareable Durable Object
 * to manages prompts at runtime.
 * 
 * @module teleprompter
 * @packageDocumentation
 */
import { DurableObject } from 'cloudflare:workers'
import Teleprompter from 'teleprompter-sdk'

interface Dispatchable {
  namespace: string
}

type Prompt = Teleprompter.Prompt & Dispatchable
type PromptInput = Teleprompter.PromptInput & Dispatchable

/**
 * PromptsDurableObject is a Durable Object that stores prompts.
 * Prompts are versioned and append only.
 * 
 * This object can:
 *  - return a list of all prompts
 *  - get a prompt by id
 *  - get all versions of a prompt by id
 *  - write a prompt
 *  - delete a prompt
 */
export class PromptsDurableObject extends DurableObject {
  sql: SqlStorage = this.ctx.storage.sql
  /**
   *  The constructor is invoked once and initializes the storage.
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.toml
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS prompts(
        id TEXT PRIMARY KEY,
        prompt TEXT,
        namespace TEXT,
        version INTEGER
      );
    `)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS prompt_versions(
        id TEXT,
        prompt TEXT,
        namespace TEXT,
        version INTEGER
      );`)
  }

  toPrompt(row: Record<string, SqlStorageValue>): Prompt {
    return {
      id: row.id as string,
      prompt: row.prompt as string,
      version: row.version as number,
      namespace: row.namespace as string
    }
  }

  async list(): Promise<Prompt[]> {
    const r = this.sql.exec(`SELECT * FROM prompts`).toArray()
    return r.map<Prompt>(this.toPrompt)
  }

  async get(id: string): Promise<Prompt> {
    const r = this.sql.exec(`SELECT id, prompt, version FROM prompts WHERE id = ?`, id).one()
    return this.toPrompt(r)
  }

  async getVersions(id: string): Promise<Prompt[]> {
    const r = this.sql.exec(`SELECT id, prompt, version FROM prompt_versions WHERE id = ? ORDER BY version DESC`, id)
    const results: Prompt[] = []
    for (let row of r) {
      // Each row is an object with a property for each column.
      results.push(this.toPrompt(row));
    }
    return results
  }

  async write(prompt: PromptInput): Promise<void> {
    const v = new Date().getTime()
    this.sql.exec(`
      INSERT INTO prompts (id, prompt, version) VALUES (?, ?, ?) ON CONFLICT(id) 
        DO UPDATE SET prompt = ?, version = ? WHERE id = ?;
      `, prompt.id, prompt.prompt, v, prompt.prompt, v, prompt.id)
    this.sql.exec(`INSERT INTO prompt_versions (id, prompt, version) VALUES (?, ?, ?);`, prompt.id, prompt.prompt, v)
  }

  async delete(id: string): Promise<void> {
    this.sql.exec(`DELETE FROM prompts WHERE id = ?`, id)
    this.sql.exec(`INSERT INTO prompt_versions (id, prompt, version) VALUES (?, 'DELETED', ?)`, id, new Date().getTime())
  }
}

async function sendUpdate(env: Env, input: Prompt): Promise<void> {
  const queue = env.PUBLISH_QUEUES.get(input.namespace)
  return queue.put(Teleprompter.UpdateMessage(input))
}

async function sendDelete(env: Env, id: string, namespace: string): Promise<void> {
  const queue = env.PUBLISH_QUEUES.get(namespace)
  return queue.put(Teleprompter.DeleteMessage(id))
}


/**
 * The prompts worker manages prompts.
 * 
 * - GET /prompts return all prompts
 * - GET /prompts/:id get a prompt
 * - GET /prompts/:id/versions get all versions of a prompt
 * - POST /prompts create a new version of a prompt
 * - DELETE /prompts/:id delete a prompt
 * - POST /prompts/:id/versions/:version rollback a prompt to a previous version
 *
 * @param request - The request submitted to the Worker from the client
 * @param env - The interface to reference bindings declared in wrangler.toml
 * @param ctx - The execution context of the Worker
 * @returns The response to be sent back to the client
 */
export default {
  async fetch(request, env, ctx): Promise<Response> {
    let id: DurableObjectId = env.PROMPTS.idFromName("teleprompter")
    let prompts = env.PROMPTS.get(id)

    const path = new URL(request.url).pathname
    if (!path.startsWith('/prompts')) {
      return new Response('Not found', { status: 404 })
    }

    if (request.method === 'GET') {
      const matches = path.match(/^\/prompts\/([^\/]+)(\/versions)?\/?$/)
      if (matches) {
        const id = matches[1]
        const versions = matches[2] === '/versions'
        if (versions) {
          // GET /prompts/:id/versions get all versions of a prompt - prompts.getVersions(id)
          return new Response(JSON.stringify(await prompts.getVersions(id)), { status: 200 })
        }
        // GET /prompts/:id get a prompt - prompts.get(id)
        return new Response(JSON.stringify(await prompts.get(id)), { status: 200 })
      }
      if (/^\/prompts\/?$/.test(path)) {
        // GET /prompts return all prompts  - prompts.list()
        return new Response(JSON.stringify(await prompts.list()), { status: 200 })
      }
    } else if (request.method === 'POST' && /^\/prompts\/?$/.test(path)) {
      // POST /prompts create a new prompt - prompts.create(...)
      const prompt = await request.json<PromptInput>()
      if (!prompt.id || !prompt.prompt || prompt.id.includes('/')) {
        return new Response('Bad request', { status: 400 })
      }

      await prompts.write({ ...prompt })
      // dispathc an update message
      ctx.waitUntil((async () => {
        const p = await prompts.get(prompt.id)
        await sendUpdate(env, p)
      })())

      return new Response('Created', { status: 201 })
    } else if (request.method === 'POST') {
      const matches = path.match(/^\/prompts\/([^\/]+)\/versions\/(\d+)\/?$/)
      if (matches != null && matches.length >= 3) {
        const id = matches[1]
        const version = matches[2]
        const vers = await prompts.getVersions(id) as Prompt[]
        const rbVer = vers.find(v => v.version === parseInt(version))
        if (!rbVer) {
          return new Response('Not found', { status: 404 })
        }

        await prompts.write({ id, prompt: rbVer.prompt, namespace: rbVer.namespace })
        // dispatch an update message
        ctx.waitUntil((async () => {
          const p = await prompts.get(id)
          await sendUpdate(env, p)
        })())

        return new Response('Rolled back', { status: 200 })
      }
    } else if (request.method === 'DELETE') {
      const matches = path.match(/^\/prompts\/([^\/]+)\/?$/)
      if (!matches) {
        return new Response('Not found', { status: 404 })
      }
      const id = matches[1]
      // DELETE /prompts/:id delete a prompt - prompts.delete(id)
      const p : Prompt = await prompts.get(id)
      await prompts.delete(id)
      // dispatch a delete message
      ctx.waitUntil((async () => {
        await sendDelete(env, id, p.namespace)
      })())
      return new Response('Deleted', { status: 200 })
    }
    return new Response('Method not allowed', { status: 405 })
  },
} satisfies ExportedHandler<Env>

export type * from './index.d.ts'