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