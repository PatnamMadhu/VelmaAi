import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { storage } from "./storage";
import { groqService } from "./services/groqService";
import { memoryService } from "./services/memory";
import { chatRequestSchema, contextRequestSchema } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  sessionId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time streaming
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections
  const connections = new Map<string, WebSocketClient>();

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'register') {
          ws.sessionId = data.sessionId;
          connections.set(data.sessionId, ws);
          console.log(`Client registered with session: ${data.sessionId}`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.sessionId) {
        connections.delete(ws.sessionId);
        console.log(`Client disconnected: ${ws.sessionId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // API Routes
  
  // POST /api/context - Store user context
  app.post('/api/context', async (req, res) => {
    try {
      const validatedData = contextRequestSchema.parse(req.body);
      await memoryService.updateContext(validatedData.sessionId, validatedData.content);
      
      res.json({ 
        success: true, 
        message: 'Context saved successfully' 
      });
    } catch (error) {
      console.error('Context save error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: 'Failed to save context' 
      });
    }
  });

  // POST /api/chat - Process chat message and stream response
  app.post('/api/chat', async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const { message, sessionId, isVoice } = validatedData;

      // Get conversation context
      const { context, recentMessages } = await memoryService.getConversationContext(sessionId);
      
      // Debug logging
      console.log(`Context for session ${sessionId}:`, context ? `"${context.substring(0, 100)}..."` : 'No context found');

      // Save user message
      await memoryService.addMessage(sessionId, message, 'user', isVoice);

      // Get WebSocket connection for streaming
      const wsClient = connections.get(sessionId);
      
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        // Stream response via WebSocket
        wsClient.send(JSON.stringify({
          type: 'stream_start',
          messageId: Date.now().toString(),
        }));

        const messages = groqService.buildMessages(message, context, recentMessages);
        console.log('Messages being sent to Groq:', JSON.stringify(messages, null, 2));
        
        let fullResponse = '';
        const aiResponse = await groqService.generateResponse(messages, (chunk) => {
          fullResponse += chunk;
          if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify({
              type: 'stream_chunk',
              content: chunk,
            }));
          }
        });

        // Save AI response
        await memoryService.addMessage(sessionId, aiResponse, 'assistant');

        // Send completion signal
        if (wsClient.readyState === WebSocket.OPEN) {
          wsClient.send(JSON.stringify({
            type: 'stream_end',
            fullResponse: aiResponse,
          }));
        }

        res.json({ 
          success: true, 
          response: aiResponse,
          streaming: true 
        });
      } else {
        // Fallback to regular response if no WebSocket
        const messages = groqService.buildMessages(message, context, recentMessages);
        const aiResponse = await groqService.generateResponse(messages);
        
        await memoryService.addMessage(sessionId, aiResponse, 'assistant');
        
        res.json({ 
          success: true, 
          response: aiResponse,
          streaming: false 
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: 'Failed to process chat message' 
      });
    }
  });

  // POST /api/context - Save context
  app.post('/api/context', async (req, res) => {
    try {
      const validatedData = contextRequestSchema.parse(req.body);
      const { sessionId, content } = validatedData;
      
      await memoryService.updateContext(sessionId, content);
      
      res.json({ 
        success: true,
        message: 'Context saved successfully' 
      });
    } catch (error) {
      console.error('Context save error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: 'Failed to save context' 
      });
    }
  });

  // GET /api/context/:sessionId - Get context
  app.get('/api/context/:sessionId', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { context } = await memoryService.getConversationContext(sessionId);
      
      res.json({ 
        context: context || null,
        hasContext: !!context
      });
    } catch (error) {
      console.error('Context fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch context' 
      });
    }
  });

  // GET /api/memory/:sessionId - Get memory status
  app.get('/api/memory/:sessionId', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { context, recentMessages, messageCount } = await memoryService.getConversationContext(sessionId);
      
      res.json({
        hasContext: !!context,
        messageCount,
        memoryUsage: memoryService.getMemoryUsage(messageCount),
        maxMessages: 10,
        contextPreview: context ? context.substring(0, 100) + '...' : null
      });
    } catch (error) {
      console.error('Memory status error:', error);
      res.status(500).json({ 
        error: 'Failed to get memory status' 
      });
    }
  });

  // GET /api/messages/:sessionId - Get conversation history
  app.get('/api/messages/:sessionId', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getRecentMessages(sessionId);
      
      res.json({ messages });
    } catch (error) {
      console.error('Messages fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch messages' 
      });
    }
  });

  // DELETE /api/session/:sessionId - Clear session data
  app.delete('/api/session/:sessionId', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await memoryService.clearSession(sessionId);
      
      res.json({ 
        success: true, 
        message: 'Session cleared successfully' 
      });
    } catch (error) {
      console.error('Session clear error:', error);
      res.status(500).json({ 
        error: 'Failed to clear session' 
      });
    }
  });

  return httpServer;
}
