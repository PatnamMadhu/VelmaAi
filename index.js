// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z as z2 } from "zod";

// server/storage.ts
var MemStorage = class {
  contexts;
  messages;
  contextId;
  messageId;
  constructor() {
    this.contexts = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.contextId = 1;
    this.messageId = 1;
  }
  async saveContext(insertContext) {
    const context = {
      id: this.contextId++,
      ...insertContext,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contexts.set(insertContext.sessionId, context);
    return context;
  }
  async getContext(sessionId) {
    return this.contexts.get(sessionId);
  }
  async saveMessage(insertMessage) {
    const message = {
      id: this.messageId++,
      sessionId: insertMessage.sessionId,
      content: insertMessage.content,
      role: insertMessage.role,
      timestamp: /* @__PURE__ */ new Date(),
      isVoice: insertMessage.isVoice ?? false
    };
    if (!this.messages.has(insertMessage.sessionId)) {
      this.messages.set(insertMessage.sessionId, []);
    }
    const sessionMessages = this.messages.get(insertMessage.sessionId);
    sessionMessages.push(message);
    if (sessionMessages.length > 10) {
      sessionMessages.splice(0, sessionMessages.length - 10);
    }
    return message;
  }
  async getRecentMessages(sessionId, limit = 10) {
    const sessionMessages = this.messages.get(sessionId) || [];
    return sessionMessages.slice(-limit);
  }
  async clearOldMessages(sessionId, keepCount) {
    const sessionMessages = this.messages.get(sessionId);
    if (sessionMessages && sessionMessages.length > keepCount) {
      sessionMessages.splice(0, sessionMessages.length - keepCount);
    }
  }
  async clearSession(sessionId) {
    this.contexts.delete(sessionId);
    this.messages.delete(sessionId);
  }
};
var storage = new MemStorage();

// server/services/groqService.ts
import dotenv from "dotenv";
dotenv.config();
var GroqService = class {
  apiKey;
  baseUrl = "https://api.groq.com/openai/v1";
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ENV_VAR || "";
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not found, AI responses will be simulated");
    }
  }
  async generateResponse(messages2, onStream) {
    if (!this.apiKey) {
      return this.simulateResponse(messages2[messages2.length - 1].content, onStream);
    }
    try {
      const requestBody = {
        model: "llama-3.1-8b-instant",
        // Ultra-fast model for sub-1s responses
        messages: messages2,
        temperature: 0.7,
        // Balanced temperature for natural responses
        max_tokens: 1500,
        // Increased for complete technical responses
        stream: !!onStream,
        stop: null
        // Ensure complete responses
      };
      console.log("Groq API request:", JSON.stringify(requestBody, null, 2));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!onStream) {
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Groq API error: ${response.status} ${response.statusText}`);
          console.error("Error response body:", errorText);
          throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        console.log("Groq response:", JSON.stringify(data, null, 2));
        return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get response reader");
      let fullResponse = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                onStream?.(content);
              }
              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason === "stop" || finishReason === "length") {
                break;
              }
            } catch (e) {
            }
          }
        }
      }
      if (fullResponse.trim() && !this.isResponseComplete(fullResponse)) {
        console.log("Response appears incomplete, adding natural conclusion");
        const conclusion = this.addNaturalConclusion(fullResponse);
        if (onStream && conclusion) {
          onStream(conclusion);
        }
        fullResponse += conclusion;
      }
      return fullResponse;
    } catch (error) {
      console.error("Groq API error:", error);
      if (error.name === "AbortError" || error.message?.includes("timeout")) {
        console.log("API timeout - falling back to fast simulation");
        return this.simulateResponse(messages2[messages2.length - 1].content, onStream);
      }
      return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
  }
  async simulateResponse(userMessage, onStream) {
    const responseStarters = [
      "In my experience with that technology,",
      "I've worked with this extensively.",
      "From my projects, here's how I approached it:",
      "I've dealt with this challenge before."
    ];
    const starter = responseStarters[Math.floor(Math.random() * responseStarters.length)];
    const fullResponse = `${starter} I typically break this down into a few key areas:

\u2022 **Implementation approach:** I start by understanding the specific requirements and constraints
\u2022 **Best practices:** I follow industry standards and leverage proven patterns  
\u2022 **Real-world considerations:** I always think about scalability, maintainability, and performance

For example, in one of my recent projects, I had to solve a similar challenge. I implemented a solution that improved efficiency by about 30% while keeping the code clean and well-documented.

The key is balancing technical excellence with practical delivery timelines.`;
    if (onStream) {
      const sentences = fullResponse.split(". ");
      for (let i = 0; i < sentences.length; i++) {
        const sentence = i === sentences.length - 1 ? sentences[i] : sentences[i] + ". ";
        const words = sentence.split(" ");
        for (let j = 0; j < words.length; j++) {
          const chunk = j === 0 && i === 0 ? words[j] : " " + words[j];
          onStream(chunk);
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        if (i < sentences.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }
    return fullResponse;
  }
  isResponseComplete(response) {
    const trimmed = response.trim();
    const incompletePatterns = [
      /\band\s*$/i,
      // ends with "and"
      /\bor\s*$/i,
      // ends with "or"
      /\bthe\s*$/i,
      // ends with "the"
      /\bto\s*$/i,
      // ends with "to"
      /\bof\s*$/i,
      // ends with "of"
      /\bin\s*$/i,
      // ends with "in"
      /\bfor\s*$/i,
      // ends with "for"
      /\bwith\s*$/i,
      // ends with "with"
      /\bthat\s*$/i,
      // ends with "that"
      /\bwhich\s*$/i,
      // ends with "which"
      /\bwhen\s*$/i,
      // ends with "when"
      /\bwhile\s*$/i,
      // ends with "while"
      /\bbecause\s*$/i,
      // ends with "because"
      /\bso\s*$/i,
      // ends with "so"
      /\bbut\s*$/i,
      // ends with "but"
      /\balso\s*$/i,
      // ends with "also"
      /,\s*$/,
      // ends with comma
      /:\s*$/
      // ends with colon
    ];
    for (const pattern of incompletePatterns) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }
    return trimmed.length > 50 && /[.!?]\s*$/.test(trimmed);
  }
  addNaturalConclusion(response) {
    const trimmed = response.trim();
    if (trimmed.length < 30) {
      return "";
    }
    const conclusions = [
      " That's been my approach to handling this type of challenge.",
      " This strategy has worked well for me in production environments.",
      " I find this approach balances performance with maintainability effectively.",
      " That's how I've successfully implemented this in my projects.",
      " This methodology has proven reliable in my experience."
    ];
    const lowerResponse = trimmed.toLowerCase();
    if (lowerResponse.includes("database") || lowerResponse.includes("data")) {
      return " This approach ensures data integrity while maintaining good performance.";
    } else if (lowerResponse.includes("api") || lowerResponse.includes("request")) {
      return " This design provides a robust and scalable API architecture.";
    } else if (lowerResponse.includes("test") || lowerResponse.includes("quality")) {
      return " This testing strategy has helped me maintain high code quality.";
    } else if (lowerResponse.includes("performance") || lowerResponse.includes("optimize")) {
      return " This optimization approach has delivered measurable performance improvements.";
    }
    return conclusions[Math.floor(Math.random() * conclusions.length)];
  }
  buildMessages(userMessage, context, recentMessages = []) {
    const messages2 = [];
    let systemPrompt = `You are AnmaAI, a real-time AI assistant trained to behave exactly like a confident software engineer in a live job interview. You must:

\u2022 Respond naturally like a human\u2014not like a bot.
\u2022 Answer technical questions with structure: high-level concept \u2192 components \u2192 real-world application.
\u2022 Use STAR format only for behavioral questions.
\u2022 Keep answers concise but insightful (60-90 seconds when spoken).
\u2022 Avoid repetition or sounding scripted.
\u2022 Be confident, clear, and professional.

RESPONSE GUIDELINES:
- Listen carefully to the exact question and answer it directly
- Speak naturally with varied sentence structure
- Use "I" statements when referencing experience
- Include specific technical details and real-world context
- Start responses confidently but naturally
- Avoid robotic phrases like "Great question!" unless genuinely appropriate
- Focus on practical implementation over theory
- ALWAYS complete your thoughts and sentences - never cut off mid-sentence
- End with a natural conclusion that wraps up your answer

TECHNICAL STRUCTURE:
1. Direct answer with high-level concept
2. Key components or approach
3. Real-world application example
4. Brief mention of considerations (scale, performance, trade-offs)
5. Natural conclusion`;
    if (context) {
      systemPrompt += `

Your Professional Identity:
${context}

CRITICAL INSTRUCTIONS:
- You ARE this person - speak in first person using "I" statements
- ONLY reference experience, skills, and projects explicitly mentioned in the context above
- Use ONLY the specific details, technologies, and achievements listed in your background
- NEVER add information, projects, or details not present in the context
- If asked about something not in your context, politely redirect or say you haven't worked with that specific technology/situation
- Stick to the exact technologies, timeframes, and achievements mentioned
- Use the specific metrics and accomplishments provided (e.g., "30% improvement", "40% reduction")
- Keep responses conversational and interview-appropriate (60-90 seconds when spoken)`;
    } else {
      systemPrompt += `

You are helping with general interview preparation. Respond as a confident software engineer would speak in an interview. Use practical examples and "I" statements. Structure answers clearly with short paragraphs. Avoid theoretical explanations unless specifically requested.`;
    }
    messages2.push({
      role: "system",
      content: systemPrompt
    });
    for (const msg of recentMessages.slice(-6)) {
      messages2.push({
        role: msg.role,
        content: msg.content
      });
    }
    messages2.push({
      role: "user",
      content: userMessage
    });
    return messages2;
  }
};
var groqService = new GroqService();

// server/services/memory.ts
var MemoryService = class {
  maxMessages = 10;
  async getConversationContext(sessionId) {
    const [context, recentMessages] = await Promise.all([
      storage.getContext(sessionId),
      storage.getRecentMessages(sessionId, this.maxMessages)
    ]);
    return {
      context: context?.content,
      recentMessages,
      messageCount: recentMessages.length
    };
  }
  async addMessage(sessionId, content, role, isVoice = false) {
    const message = await storage.saveMessage({
      sessionId,
      content,
      role,
      isVoice
    });
    await storage.clearOldMessages(sessionId, this.maxMessages);
    return message;
  }
  async updateContext(sessionId, content) {
    await storage.saveContext({
      sessionId,
      content
    });
  }
  async clearSession(sessionId) {
    await storage.clearSession(sessionId);
  }
  getMemoryUsage(messageCount) {
    return Math.min(messageCount / this.maxMessages * 100, 100);
  }
};
var memoryService = new MemoryService();

// shared/schema.ts
import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var contexts = pgTable("contexts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow(),
  isVoice: boolean("is_voice").default(false)
});
var insertContextSchema = createInsertSchema(contexts).omit({
  id: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});
var chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  isVoice: z.boolean().default(false)
});
var contextRequestSchema = z.object({
  content: z.string().min(1),
  sessionId: z.string()
});

// server/routes.ts
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const connections = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, req) => {
    console.log("WebSocket connection established");
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "register") {
          ws.sessionId = data.sessionId;
          connections.set(data.sessionId, ws);
          console.log(`Client registered with session: ${data.sessionId}`);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      if (ws.sessionId) {
        connections.delete(ws.sessionId);
        console.log(`Client disconnected: ${ws.sessionId}`);
      }
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  app2.post("/api/context", async (req, res) => {
    try {
      const validatedData = contextRequestSchema.parse(req.body);
      await memoryService.updateContext(validatedData.sessionId, validatedData.content);
      res.json({
        success: true,
        message: "Context saved successfully"
      });
    } catch (error) {
      console.error("Context save error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: "Failed to save context"
      });
    }
  });
  app2.post("/api/chat", async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const { message, sessionId, isVoice } = validatedData;
      const { context, recentMessages } = await memoryService.getConversationContext(sessionId);
      console.log(`Context for session ${sessionId}:`, context ? `"${context.substring(0, 100)}..."` : "No context found");
      await memoryService.addMessage(sessionId, message, "user", isVoice);
      const wsClient = connections.get(sessionId);
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify({
          type: "stream_start",
          messageId: Date.now().toString()
        }));
        const messages2 = groqService.buildMessages(message, context, recentMessages);
        console.log("Messages being sent to Groq:", JSON.stringify(messages2, null, 2));
        let fullResponse = "";
        const aiResponse = await groqService.generateResponse(messages2, (chunk) => {
          fullResponse += chunk;
          if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify({
              type: "stream_chunk",
              content: chunk
            }));
          }
        });
        await memoryService.addMessage(sessionId, aiResponse, "assistant");
        if (wsClient.readyState === WebSocket.OPEN) {
          wsClient.send(JSON.stringify({
            type: "stream_end",
            fullResponse: aiResponse
          }));
        }
        res.json({
          success: true,
          response: aiResponse,
          streaming: true
        });
      } else {
        const messages2 = groqService.buildMessages(message, context, recentMessages);
        const aiResponse = await groqService.generateResponse(messages2);
        await memoryService.addMessage(sessionId, aiResponse, "assistant");
        res.json({
          success: true,
          response: aiResponse,
          streaming: false
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: "Failed to process chat message"
      });
    }
  });
  app2.get("/api/context/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { context } = await memoryService.getConversationContext(sessionId);
      res.json({
        context: context || null,
        hasContext: !!context
      });
    } catch (error) {
      console.error("Context fetch error:", error);
      res.status(500).json({
        error: "Failed to fetch context"
      });
    }
  });
  app2.get("/api/memory/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { context, recentMessages, messageCount } = await memoryService.getConversationContext(sessionId);
      res.json({
        hasContext: !!context,
        messageCount,
        memoryUsage: memoryService.getMemoryUsage(messageCount),
        maxMessages: 10,
        contextPreview: context ? context.substring(0, 100) + "..." : null
      });
    } catch (error) {
      console.error("Memory status error:", error);
      res.status(500).json({
        error: "Failed to get memory status"
      });
    }
  });
  app2.get("/api/messages/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages2 = await storage.getRecentMessages(sessionId);
      res.json({ messages: messages2 });
    } catch (error) {
      console.error("Messages fetch error:", error);
      res.status(500).json({
        error: "Failed to fetch messages"
      });
    }
  });
  app2.delete("/api/session/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await memoryService.clearSession(sessionId);
      res.json({
        success: true,
        message: "Session cleared successfully"
      });
    } catch (error) {
      console.error("Session clear error:", error);
      res.status(500).json({
        error: "Failed to clear session"
      });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
