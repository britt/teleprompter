/**
 * Teleprompter SDK
 * 
 * This SDK provides methods to interact with the Teleprompter service.
 */

export class TeleprompterSDK {
  private baseUrl?: string
  private binding?: any

  constructor(urlOrBinding: string | any) {
    if (typeof urlOrBinding === 'string') {
      this.baseUrl = urlOrBinding
    } else {
      this.binding = urlOrBinding
    }
  }

  private async fetch(path: string, init?: RequestInit): Promise<Response> {
    if (this.baseUrl) {
      return fetch(`${this.baseUrl}${path}`, init)
    } else if (this.binding) {
      return this.binding.fetch(`https://dummy${path}`, init)
    } else {
      throw new Error('TeleprompterSDK was not initialized correctly')
    }
  }

  /**
   * Get all prompts
   */
  async listPrompts(): Promise<Prompt[]> {
    const response = await this.fetch('/prompts')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Get a specific prompt by ID
   */
  async getPrompt(id: string): Promise<Prompt> {
    const response = await this.fetch(`/prompts/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Get all versions of a specific prompt
   */
  async getPromptVersions(id: string): Promise<Prompt[]> {
    const response = await this.fetch(`/prompts/${id}/versions`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Create a new prompt or update an existing one
   */
  async writePrompt(prompt: PromptInput): Promise<void> {
    const response = await this.fetch('/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<void> {
    const response = await this.fetch(`/prompts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  /**
   * Rollback a prompt to a previous version
   */
  async rollbackPrompt(id: string, version: number): Promise<void> {
    const response = await this.fetch(`/prompts/${id}/versions/${version}`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
}
