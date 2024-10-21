/**
 * Teleprompter SDK
 * 
 * This SDK provides methods to interact with the Teleprompter service.
 */

export class TeleprompterSDK {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all prompts
   */
  async listPrompts(): Promise<Prompt[]> {
    const response = await fetch(`${this.baseUrl}/prompts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get a specific prompt by ID
   */
  async getPrompt(id: string): Promise<Prompt> {
    const response = await fetch(`${this.baseUrl}/prompts/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get all versions of a specific prompt
   */
  async getPromptVersions(id: string): Promise<Prompt[]> {
    const response = await fetch(`${this.baseUrl}/prompts/${id}/versions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Create a new prompt or update an existing one
   */
  async writePrompt(prompt: PromptInput): Promise<void> {
    const response = await fetch(`${this.baseUrl}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/prompts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Rollback a prompt to a previous version
   */
  async rollbackPrompt(id: string, version: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/prompts/${id}/versions/${version}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}
