import { storage } from "../storage";
import { Message } from "@shared/schema";

export class MemoryService {
  private readonly maxMessages = 10;

  async getConversationContext(sessionId: string): Promise<{
    context?: string;
    recentMessages: Message[];
    messageCount: number;
  }> {
    const [context, recentMessages] = await Promise.all([
      storage.getContext(sessionId),
      storage.getRecentMessages(sessionId, this.maxMessages),
    ]);

    return {
      context: context?.content,
      recentMessages,
      messageCount: recentMessages.length,
    };
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
