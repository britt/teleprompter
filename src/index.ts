/**
 * Teleprompter is a Cloudflare Worker and shareable Durable Object
 * to manages prompts at runtime.
 * 
 * @module teleprompter
 * @packageDocumentation
 */
import { DurableObject } from 'cloudflare:workers'


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
	sql: SqlStorage
	/**
	 *  The constructor is invoked once and initializes the storage.
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)
		this.sql = ctx.storage.sql

    this.sql.exec(`DROP TABLE IF EXISTS prompts`)
    this.sql.exec(`DROP INDEX IF EXISTS prompts_id`)
    this.sql.exec(`DROP TABLE IF EXISTS versions`)
    this.sql.exec(`DROP INDEX IF EXISTS versions_id`)
		this.sql.exec(`
      CREATE TABLE IF NOT EXISTS prompts(
        id TEXT PRIMARY KEY,
        prompt TEXT,
        version INTEGER
      );
    `)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS prompt_versions(
        id TEXT,
        prompt TEXT,
        version INTEGER
      );`)
	}

	toPrompt(row: Record<string, SqlStorageValue>): Prompt {
		return {
			id: row.id as string,
			prompt: row.text as string,
			version: row.version as number,
		}
	}

	async list(): Promise<Prompt[]> {
		const r = this.sql.exec(`SELECT * FROM prompts`).toArray()
		return r.map<Prompt>(this.toPrompt)
	}

	async get(id: string): Promise<Prompt> {
		const r = this.sql.exec(`SELECT * FROM prompts WHERE id = ?`, [id]).one()
		return this.toPrompt(r)
	}

	async getVersions(id: string): Promise<Prompt[]> {
		const r = this.sql.exec(`SELECT * FROM prompt_versions WHERE id = ?`, [id]).toArray()
		return r.map<Prompt>(this.toPrompt)
	}

	async write(prompt: PromptInput): Promise<void> {
    const v = new Date().getTime()
    console.log(`Writing prompt ${prompt.id} version ${v}`, prompt.prompt)
		this.sql.exec(`INSERT INTO prompt_versions (id, prompt, version) VALUES (?, ?, ?)`, prompt.id, prompt.prompt, v)
		this.sql.exec(`INSERT INTO prompts (id, prompt, version) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET prompt=?,version=?`, prompt.id, prompt.prompt, v, prompt.prompt, v)
	}

	async delete(id: string): Promise<void> {
		this.sql.exec(`INSERT INTO prompt_versions (id, prompt, version) VALUES (?, 'DELETED', ?)`, [id, new Date().getTime()])
		this.sql.exec(`DELETE FROM prompts WHERE id = ?`, [id])
	}
}

/**
 * The prompts worker manages prompts.
 * 
 * - GET /prompts return all prompts
 * - GET /prompts/:id get a prompt
 * - GET /prompts/:id/versions get all versions of a prompt
 * - POST /prompts create a new version of a prompt
 * - DELETE /prompts/:id delete a prompt
 *
 * @param request - The request submitted to the Worker from the client
 * @param env - The interface to reference bindings declared in wrangler.toml
 * @param ctx - The execution context of the Worker
 * @returns The response to be sent back to the client
 */
export default {
	async fetch(request, env, ctx): Promise<Response> {
		let id: DurableObjectId = env.PROMPTS.idFromName(new URL(request.url).pathname)
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
    }
    else if (request.method === 'POST' && /^\/prompts\/?$/.test(path)) {
      // POST /prompts create a new prompt - prompts.create(...)
      const prompt = await request.json<PromptInput>()
      if (!prompt.id || !prompt.prompt || prompt.id.includes('/')) {
        return new Response('Bad request', { status: 400 })
      }

      await prompts.write({ ...prompt })
      return new Response('Created', { status: 201 })
    }
    else if (request.method === 'DELETE') {
      const matches = path.match(/^\/prompts\/([^\/]+)\/?$/)
      if (!matches) {
        return new Response('Not found', { status: 404 })
      }
      const id = matches[1]
      // DELETE /prompts/:id delete a prompt - prompts.delete(id)
      await prompts.delete(id)
      return new Response('Deleted', { status: 200 })
    }
    return new Response('Method not allowed', { status: 405 })
	},
} satisfies ExportedHandler<Env>
