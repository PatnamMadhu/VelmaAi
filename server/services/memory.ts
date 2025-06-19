import { storage } from "../storage";
import { Message } from "@shared/schema";

export class MemoryService {
  private readonly maxMessages = 10;
  private readonly contextMessages = 2; // Only use last 2 messages for focused context

  async getConversationContext(sessionId: string): Promise<{
    context?: string;
    recentMessages: Message[];
    messageCount: number;
  }> {
    const [context, recentMessages] = await Promise.all([
      storage.getContext(sessionId),
      storage.getRecentMessages(sessionId, this.contextMessages), // Use only last 2 messages for focused context
    ]);

    return {
      context: context?.content,
      recentMessages,
      messageCount: recentMessages.length,
    };
  }

  async getFullMessageHistory(sessionId: string): Promise<Message[]> {
    return await storage.getRecentMessages(sessionId, this.maxMessages);
  }

  async addMessage(sessionId: string, content: string, role: "user" | "assistant", isVoice: boolean = false): Promise<Message> {
    const message = await storage.saveMessage({
      sessionId,
      content,
      role,
      isVoice,
    });

    // Clean up old messages to maintain memory limit
    await storage.clearOldMessages(sessionId, this.maxMessages);

    return message;
  }

  async updateContext(sessionId: string, content: string): Promise<void> {
    await storage.saveContext({
      sessionId,
      content,
    });
  }

  async clearSession(sessionId: string): Promise<void> {
    await storage.clearSession(sessionId);
  }

  getMemoryUsage(messageCount: number): number {
    return Math.min((messageCount / this.maxMessages) * 100, 100);
  }
}

export const memoryService = new MemoryService();
