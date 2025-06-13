import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Context storage schema
export const contexts = pgTable("contexts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message schema for chat history
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow(),
  isVoice: boolean("is_voice").default(false),
});

export const insertContextSchema = createInsertSchema(contexts).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertContext = z.infer<typeof insertContextSchema>;
export type Context = typeof contexts.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Chat request/response schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  isVoice: z.boolean().default(false),
});

export const contextRequestSchema = z.object({
  content: z.string().min(1),
  sessionId: z.string(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ContextRequest = z.infer<typeof contextRequestSchema>;
