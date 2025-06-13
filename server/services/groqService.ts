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
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: !!onStream,
      };
      
      console.log('Groq API request:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

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
    } catch (error) {
      console.error("Groq API error:", error);
      return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
  }

  private async simulateResponse(userMessage: string, onStream?: (chunk: string) => void): Promise<string> {
    const responses = [
      "Based on your background and experience, I can help you prepare for this topic. Let me break down the key points you should focus on...",
      "That's an excellent question! Given your context as a Senior Software Engineer, here are the specific areas you should highlight...",
      "I understand you're preparing for an interview. Let me provide you with a structured response that aligns with your experience...",
    ];

    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const fullResponse = `${baseResponse}\n\nKey considerations:\n• Technical depth and practical examples\n• Leadership and collaboration experiences\n• Problem-solving approach and methodology\n• Impact and results from your previous work\n\nWould you like me to elaborate on any of these areas?`;

    if (onStream) {
      // Simulate streaming
      const words = fullResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? words[i] : " " + words[i]);
        onStream(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return fullResponse;
  }

  buildMessages(userMessage: string, context?: string, recentMessages: any[] = []): GroqMessage[] {
    const messages: GroqMessage[] = [];

    // System message with context
    let systemPrompt = "You are an AI interview assistant helping users prepare for job interviews. Provide specific, actionable advice based on the user's background and context.";
    
    if (context) {
      systemPrompt += `\n\nUser's background and context:\n${context}`;
    }

    messages.push({
      role: "system",
      content: systemPrompt,
    });

    // Add recent conversation history
    for (const msg of recentMessages.slice(-8)) { // Keep last 8 messages for context
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
