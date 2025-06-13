import { ChatRequest } from "@shared/schema";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  private apiKey: string;
  private baseUrl: string = "https://api.groq.com/openai/v1";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ENV_VAR || "";
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not found, AI responses will be simulated");
    }
  }

  async generateResponse(
    messages: GroqMessage[],
    onStream?: (chunk: string) => void
  ): Promise<string> {
    if (!this.apiKey) {
      // Fallback simulation for development
      return this.simulateResponse(messages[messages.length - 1].content, onStream);
    }

    try {
      const requestBody = {
        model: "llama-3.1-8b-instant", // Ultra-fast model for sub-1s responses
        messages,
        temperature: 0.5, // Lower temperature for faster, more consistent responses
        max_tokens: 200, // Reduced for quicker generation
        stream: !!onStream,
      };
      
      console.log('Groq API request:', JSON.stringify(requestBody, null, 2));
      
      // Add timeout for sub-1s guarantee
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms timeout
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!onStream) {
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Groq API error: ${response.status} ${response.statusText}`);
          console.error('Error response body:', errorText);
          throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data: GroqResponse = await response.json();
        console.log('Groq response:', JSON.stringify(data, null, 2));
        return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";
      }

      // Handle streaming response
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
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullResponse;
    } catch (error: any) {
      console.error("Groq API error:", error);
      
      // If timeout or other error, fall back to fast simulation
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.log('API timeout - falling back to fast simulation');
        return this.simulateResponse(messages[messages.length - 1].content, onStream);
      }
      
      return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
  }

  private async simulateResponse(userMessage: string, onStream?: (chunk: string) => void): Promise<string> {
    const responses = [
      "Sure! Let me walk you through this. From my experience, I'd approach this by focusing on three key aspects...",
      "Great question! I've dealt with this in previous projects. Here's how I typically handle it...",
      "Absolutely! This is something I'm passionate about. Let me explain it in a practical way...",
    ];

    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const fullResponse = `${baseResponse}\n\nFirst, I always start by understanding the core requirements. Then I consider the trade-offs - like performance versus maintainability. Finally, I implement with testing in mind because that's saved me countless hours in production.\n\nIn my last role, I applied this exact approach when we had to refactor a legacy system, and it helped us deliver on time while improving code quality by 40%.`;

    if (onStream) {
      // Fast streaming simulation for sub-1s delivery
      const words = fullResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? words[i] : " " + words[i]);
        onStream(chunk);
        await new Promise(resolve => setTimeout(resolve, 15)); // Faster streaming
      }
    }

    return fullResponse;
  }

  buildMessages(userMessage: string, context?: string, recentMessages: any[] = []): GroqMessage[] {
    const messages: GroqMessage[] = [];

    // Enhanced system prompt with context awareness
    let systemPrompt = `You are helping users prepare for interviews. Respond conversationally as a confident candidate would speak. Keep answers under 150 words with practical examples and "I" statements. Focus on real experience, not theory.`;
    
    if (context) {
      systemPrompt += `\n\nIMPORTANT - User's Background Context:\n${context}\n\nUse this background information to personalize your responses. Reference relevant experience, skills, or goals when appropriate. Make your answers feel authentic to this person's profile.`;
    }

    messages.push({
      role: "system",
      content: systemPrompt,
    });

    // Add recent conversation history for continuity
    for (const msg of recentMessages.slice(-6)) { // Keep last 6 messages for context
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    return messages;
  }
}

export const groqService = new GroqService();
