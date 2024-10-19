interface PromptInput {
	id: string
	text: string
}

interface Prompt extends PromptInput {
  version: number
}