import { parseDotprompt } from '../parser'

describe('parseDotprompt', () => {
	it('parses a full dotprompt with frontmatter', () => {
		const source = [
			'---',
			'model: googleai/gemini-1.5-pro',
			'config:',
			'  temperature: 0.9',
			'input:',
			'  schema:',
			'    topic: string',
			'output:',
			'  format: json',
			'  schema:',
			'    title: string',
			'---',
			'Write about {{topic}}.',
		].join('\n')

		const result = parseDotprompt(source)

		expect(result.source).toBe(source)
		expect(result.metadata.model).toBe('googleai/gemini-1.5-pro')
		expect(result.metadata.config).toEqual({ temperature: 0.9 })
		expect(result.metadata.input?.schema).toEqual({ topic: 'string' })
		expect(result.metadata.output?.format).toBe('json')
		expect(result.metadata.output?.schema).toEqual({ title: 'string' })
		expect(result.template).toBe('Write about {{topic}}.')
	})

	it('handles a plain template with no frontmatter (backward compat)', () => {
		const source = 'Hello {{name}}, welcome!'

		const result = parseDotprompt(source)

		expect(result.source).toBe(source)
		expect(result.metadata).toEqual({})
		expect(result.template).toBe(source)
	})

	it('parses frontmatter with only model specified', () => {
		const source = '---\nmodel: openai/gpt-4\n---\nTell me a joke.'

		const result = parseDotprompt(source)

		expect(result.metadata.model).toBe('openai/gpt-4')
		expect(result.template).toBe('Tell me a joke.')
	})

	it('preserves description and tools in metadata', () => {
		const source = [
			'---',
			'description: Summarizes articles',
			'tools:',
			'  - search',
			'  - fetch',
			'---',
			'Summarize: {{text}}',
		].join('\n')

		const result = parseDotprompt(source)

		expect(result.metadata.description).toBe('Summarizes articles')
		expect(result.metadata.tools).toEqual(['search', 'fetch'])
	})

	it('handles empty frontmatter gracefully', () => {
		const source = '---\n---\nJust a template.'

		const result = parseDotprompt(source)

		expect(result.metadata).toEqual({})
		expect(result.template).toBe('Just a template.')
	})

	it('handles CRLF line endings in frontmatter', () => {
		const source = '---\r\nmodel: test\r\n---\r\nHello'
		const result = parseDotprompt(source)
		expect(result.metadata.model).toBe('test')
		expect(result.template).toBe('Hello')
	})

	it('handles empty frontmatter with CRLF', () => {
		const source = '---\r\n---\r\nJust a template.'
		const result = parseDotprompt(source)
		expect(result.metadata).toEqual({})
		expect(result.template).toBe('Just a template.')
	})

	it('preserves extension fields', () => {
		const source = [
			'---',
			'model: test/model',
			'ext:',
			'  myapp:',
			'    version: 2',
			'---',
			'Hello',
		].join('\n')

		const result = parseDotprompt(source)

		expect(result.metadata.ext?.myapp).toEqual({ version: 2 })
	})
})
