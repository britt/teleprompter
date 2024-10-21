/**
 * Teleprompter SDK
 * 
 * This SDK provides methods to interact with the Teleprompter service.
 */

import { Prompt, PromptInput } from '../index';

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
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Create a new prompt or update an existing one
   */
  async writePrompt(prompt: PromptInput): Promise<void> {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<void> {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Rollback a prompt to a previous version
   */
  async rollbackPrompt(id: string, version: number): Promise<void> {
    // TODO: Implement
    throw new Error("Not implemented");
  }
}
