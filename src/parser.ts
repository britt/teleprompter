import { Dotprompt } from 'dotprompt'
import YAML from 'yaml'
import type { ParsedDotprompt, PromptMetadata } from './types'

const dp = new Dotprompt()

/** Regex to detect frontmatter: opening ---, optional YAML content, closing --- */
const frontmatterRegex = /^---[ \t]*(?:\r\n|\r|\n)([\s\S]*?)(?:\r\n|\r|\n)---[ \t]*(?:\r\n|\r|\n|$)/

/**
 * Parse a dotprompt source string into structured metadata and template.
 *
 * If the source contains YAML frontmatter (delimited by `---`), the dotprompt
 * package is used to extract metadata. If there is no frontmatter, the source
 * is returned as a plain template with empty metadata (backward compatibility).
 */
export function parseDotprompt(source: string): ParsedDotprompt {
	// No frontmatter delimiter at all — plain template
	if (!source.startsWith('---')) {
		return { source, metadata: {}, template: source }
	}

	// Empty frontmatter (---\n---\n...) — dotprompt doesn't handle this,
	// so we strip the delimiters manually
	const fmMatch = source.match(frontmatterRegex)
	if (!fmMatch || fmMatch[1].trim() === '') {
		const template = source.replace(/^---[ \t]*(?:\r\n|\r|\n)---[ \t]*(?:\r\n|\r|\n)?/, '')
		return { source, metadata: {}, template }
	}

	// Delegate to the dotprompt package for real frontmatter
	let parsed: ReturnType<typeof dp.parse>
	try {
		parsed = dp.parse(source)
	} catch {
		return { source, metadata: {}, template: source }
	}

	const metadata: PromptMetadata = {}
	if (parsed.model) metadata.model = parsed.model
	if (parsed.config && Object.keys(parsed.config).length > 0) metadata.config = parsed.config as Record<string, unknown>
	if (parsed.input) metadata.input = parsed.input
	if (parsed.output) metadata.output = parsed.output
	if (parsed.tools && parsed.tools.length > 0) metadata.tools = parsed.tools as string[]
	if (parsed.description) metadata.description = parsed.description
	// Support ext from both dotted-key notation (parsed.ext) and explicit YAML block (parsed.raw?.ext)
	const ext = (parsed.ext && Object.keys(parsed.ext).length > 0)
		? parsed.ext
		: parsed.raw?.ext
	if (ext && Object.keys(ext).length > 0) metadata.ext = ext as Record<string, Record<string, unknown>>

	return {
		source,
		metadata,
		template: parsed.template,
	}
}

export interface ValidationResult {
	valid: boolean
	error?: string
}

/**
 * Validate that a dotprompt source string has well-formed frontmatter.
 *
 * The dotprompt library silently swallows YAML parse errors, so we validate
 * the frontmatter YAML directly using the `yaml` package before delegating
 * to `parseDotprompt`.
 */
export function validateDotprompt(source: string): ValidationResult {
	// No frontmatter — always valid (plain template)
	if (!source.startsWith('---')) {
		return { valid: true }
	}

	const fmMatch = source.match(frontmatterRegex)

	// Has opening --- but no valid frontmatter block
	if (!fmMatch) {
		return { valid: false, error: 'Malformed frontmatter delimiters' }
	}

	const yamlText = fmMatch[1].trim()

	// Empty frontmatter is fine
	if (yamlText === '') {
		return { valid: true }
	}

	// Validate the YAML content directly
	try {
		const parsed = YAML.parse(yamlText)
		if (parsed !== null && (typeof parsed !== 'object' || Array.isArray(parsed))) {
			return { valid: false, error: 'Frontmatter must be a YAML mapping, not a scalar or array' }
		}
		return { valid: true }
	} catch (e) {
		return {
			valid: false,
			error: e instanceof Error ? e.message : 'Invalid YAML in frontmatter',
		}
	}
}
