import { DurableObject } from 'cloudflare:workers'

interface PromptInput {
	id: string
	text: string
}

interface Prompt extends PromptInput {
  version: number
}

/**
 * PromptsDurableObject is a Durable Object that stores prompts.
 * It has versioning and can:
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

		this.sql.exec(`
      CREATE TABLE IF NOT EXISTS prompts(
        id TEXT
        text TEXT
        version INTEGER
      );
      CREATE TABLE IF NOT EXISTS versions(
        id TEXT
        text TEXT
        version INTEGER
      );
    `)
	}

	toPrompt(row: Record<string, SqlStorageValue>): Prompt {
		return {
			id: row.id as string,
			text: row.text as string,
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
		const r = this.sql.exec(`SELECT * FROM versions WHERE id = ?`, [id]).toArray()
		return r.map<Prompt>(this.toPrompt)
	}

	async write(prompt: PromptInput): Promise<void> {
    const v = new Date().getTime()
		this.sql.exec(`INSERT INTO versions (id, text, version) VALUES (?, ?, ?)`, [prompt.id, prompt.text, v])
		this.sql.exec(`INSERT INTO prompts (id, text, version) VALUES (?, ?, ?) ON CONFLICT(id) UPDATE SET text=?,version=?`, [prompt.id, prompt.text, v, prompt.text, v])
	}

	async delete(id: string): Promise<void> {
    const v = new Date().getTime()
		this.sql.exec(`INSERT INTO versions (id, text, version) VALUES (?, 'DELETED', ?)`, [id, v])
		this.sql.exec(`DELETE FROM prompts WHERE id = ?`, [id])
	}
}

export default {
	/**
	 * The prompts worker manages prompts.
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		let id: DurableObjectId = env.PROMPTS.idFromName(new URL(request.url).pathname)
		let prompts = env.PROMPTS.get(id)

    if (request.method === 'GET') {
      // GET /prompts return all prompts  - prompts.list()
      // GET /prompts/:id get a prompt - prompts.get(id)
      // GET /prompts/:id/versions get all versions of a prompt - prompts.getVersions(id)
    }
    else if (request.method === 'POST') {
      // POST /prompts create a new prompt - prompts.create(...)
    }
    else if (request.method === 'PUT') {
      // PUT /prompts/:id update a prompt - prompts.update(id, ...)

    }
    else if (request.method === 'DELETE') {
      // DELETE /prompts/:id delete a prompt - prompts.delete(id)
    }
    else {
      return new Response('Method not allowed', { status: 405 })
    }
    
		return new Response('Hello world!', { status: 200 })
	},
} satisfies ExportedHandler<Env>
