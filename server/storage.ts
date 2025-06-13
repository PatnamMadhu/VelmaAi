import { contexts, messages, type Context, type Message, type InsertContext, type InsertMessage } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Context operations
  saveContext(context: InsertContext): Promise<Context>;
  getContext(sessionId: string): Promise<Context | undefined>;
  
  // Message operations
  saveMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(sessionId: string, limit?: number): Promise<Message[]>;
  clearOldMessages(sessionId: string, keepCount: number): Promise<void>;
  
  // Session operations
  clearSession(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private contexts: Map<string, Context>;
  private messages: Map<string, Message[]>;
  private contextId: number;
  private messageId: number;

  constructor() {
    this.contexts = new Map();
    this.messages = new Map();
    this.contextId = 1;
    this.messageId = 1;
  }

  async saveContext(insertContext: InsertContext): Promise<Context> {
    const context: Context = {
      id: this.contextId++,
      ...insertContext,
      createdAt: new Date(),
    };
    
    this.contexts.set(insertContext.sessionId, context);
    return context;
  }

  async getContext(sessionId: string): Promise<Context | undefined> {
    return this.contexts.get(sessionId);
  }

  async saveMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.messageId++,
      ...insertMessage,
      timestamp: new Date(),
    };

    if (!this.messages.has(insertMessage.sessionId)) {
      this.messages.set(insertMessage.sessionId, []);
    }

    const sessionMessages = this.messages.get(insertMessage.sessionId)!;
    sessionMessages.push(message);

    // Keep only last 10 messages for memory management
    if (sessionMessages.length > 10) {
      sessionMessages.splice(0, sessionMessages.length - 10);
    }

    return message;
  }

  async getRecentMessages(sessionId: string, limit: number = 10): Promise<Message[]> {
    const sessionMessages = this.messages.get(sessionId) || [];
    return sessionMessages.slice(-limit);
  }

  async clearOldMessages(sessionId: string, keepCount: number): Promise<void> {
    const sessionMessages = this.messages.get(sessionId);
    if (sessionMessages && sessionMessages.length > keepCount) {
      sessionMessages.splice(0, sessionMessages.length - keepCount);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    this.contexts.delete(sessionId);
    this.messages.delete(sessionId);
  }
}

export const storage = new MemStorage();
