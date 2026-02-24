describe('API response format', () => {
	it('prompt with metadata serializes correctly', () => {
		const prompt = {
			id: 'test-api',
			prompt: '---\nmodel: openai/gpt-4\n---\nHello {{name}}',
			namespace: 'TEST_QUEUE',
			version: 1700000000000,
			metadata: { model: 'openai/gpt-4' },
		}
		const json = JSON.stringify(prompt)
		const parsed = JSON.parse(json)

		expect(parsed.metadata).toBeDefined()
		expect(parsed.metadata.model).toBe('openai/gpt-4')
		expect(parsed.prompt).toContain('---')
		expect(parsed.prompt).toContain('Hello {{name}}')
	})

	it('prompt with empty metadata serializes correctly', () => {
		const prompt = {
			id: 'legacy',
			prompt: 'Hello {{name}}',
			namespace: 'TEST_QUEUE',
			version: 1700000000000,
			metadata: {},
		}
		const json = JSON.stringify(prompt)
		const parsed = JSON.parse(json)

		expect(parsed.metadata).toBeDefined()
		expect(parsed.metadata).toEqual({})
	})
})
