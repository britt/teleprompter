import type { PromptMetadata, ParsedDotprompt } from '../types'

describe('types', () => {
	it('PromptMetadata accepts a fully-populated object', () => {
		const meta: PromptMetadata = {
			model: 'googleai/gemini-1.5-pro',
			config: { temperature: 0.9 },
			input: {
				default: { name: 'World' },
				schema: { name: 'string' },
			},
			output: {
				format: 'json',
				schema: { title: 'string' },
			},
			tools: ['search'],
			description: 'A test prompt',
			ext: { myapp: { key: 'value' } },
		}
		expect(meta.model).toBe('googleai/gemini-1.5-pro')
	})

	it('PromptMetadata accepts an empty object', () => {
		const meta: PromptMetadata = {}
		expect(meta.model).toBeUndefined()
	})

	it('ParsedDotprompt holds source, metadata, and template', () => {
		const parsed: ParsedDotprompt = {
			source: '---\nmodel: test\n---\nHello',
			metadata: { model: 'test' },
			template: 'Hello',
		}
		expect(parsed.source).toContain('---')
		expect(parsed.template).toBe('Hello')
	})
})
