/**
 * PromptInput specifies a new prompt.
 * @interface PromptInput
 */
interface PromptInput {
	id: string
	prompt: string
}

/**
 * Prompt is a versioned LLM prompt referenced by id.
 * @interface Prompt
 **/
interface Prompt extends PromptInput {
  version: number
}

/**
 * TeleprompterSDK is an interface for interacting with a teleprompter service.
 * @interface TeleprompterSDK
 */
interface TeleprompterSDK {
  listPrompts(): Promise<Prompt[]>
  getPrompt(id: string): Promise<Prompt>
  getPromptVersions(id: string): Promise<Prompt[]>
  writePrompt(prompt: PromptInput): Promise<void>
  deletePrompt(id: string): Promise<void>
  rollbackPrompt(id: string, version: number): Promise<void>
}

/**
 * TeleprompterDO is an interface for interacting with a teleprompter Durable Object.
 * @interface TeleprompterDO
 */
interface TeleprompterDO {
  list(): Promise<Prompt[]>
  get(id: string): Promise<Prompt>
  getVersions(id: string): Promise<Prompt[]>
  write(prompt: PromptInput): Promise<void>
  delete(id: string): Promise<void>
}