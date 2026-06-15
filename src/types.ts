/**
 * Metadata extracted from dotprompt YAML frontmatter.
 * Stored alongside the raw template source.
 */
export interface PromptMetadata {
	model?: string
	config?: Record<string, unknown>
	input?: {
		default?: Record<string, unknown>
		schema?: Record<string, unknown>
	}
	output?: {
		format?: string
		schema?: Record<string, unknown>
	}
	tools?: string[]
	description?: string
	ext?: Record<string, Record<string, unknown>>
}

/**
 * A parsed dotprompt: the raw source plus extracted metadata.
 */
export interface ParsedDotprompt {
	source: string
	metadata: PromptMetadata
	template: string
}
