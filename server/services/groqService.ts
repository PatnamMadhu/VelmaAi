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
        max_tokens: 50, // Ultra-hard limit for concise responses
        stream: !!onStream,
      };
      
      console.log('Groq API request:', JSON.stringify(requestBody, null, 2));
      
      // Add timeout for response completion
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for complete responses
      
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
        const rawResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";
        
        // Post-process to enforce constraints
        return this.enforceResponseConstraints(rawResponse);
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

  private enforceResponseConstraints(response: string): string {
    // Remove all formatting (asterisks, bullets, etc.)
    let cleanResponse = response
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
      .replace(/^[•\-\*]\s+/gm, '') // Remove bullet points
      .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
      .replace(/\n{3,}/g, ' ') // Replace line breaks with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Force ultra-short responses: maximum 35 words
    const words = cleanResponse.split(/\s+/);
    if (words.length > 35) {
      cleanResponse = words.slice(0, 35).join(' ');
    }

    // Ensure it starts with Sure!, Absolutely!, or Great question!
    if (!cleanResponse.match(/^(Sure!|Absolutely!|Great question!)/i)) {
      cleanResponse = 'Sure! ' + cleanResponse;
    }

    // Final word count check - cut if still too long
    const finalWords = cleanResponse.split(/\s+/);
    if (finalWords.length > 40) {
      cleanResponse = finalWords.slice(0, 40).join(' ');
    }

    return cleanResponse;
  }

  private async simulateResponse(userMessage: string, onStream?: (chunk: string) => void): Promise<string> {
    const responseStarters = [
      "Sure! In my experience with that technology,",
      "Absolutely! I've worked with this extensively.",
      "Great question! From my projects, here's how I approached it:",
      "Yes, I've dealt with this challenge before.",
    ];

    const starter = responseStarters[Math.floor(Math.random() * responseStarters.length)];
    
    // Generate natural, interview-style response
    const fullResponse = `${starter} I typically break this down into a few key areas:

• **Implementation approach:** I start by understanding the specific requirements and constraints
• **Best practices:** I follow industry standards and leverage proven patterns  
• **Real-world considerations:** I always think about scalability, maintainability, and performance

For example, in one of my recent projects, I had to solve a similar challenge. I implemented a solution that improved efficiency by about 30% while keeping the code clean and well-documented.

The key is balancing technical excellence with practical delivery timelines.`;

    if (onStream) {
      // Stream naturally with slight delays between sentences
      const sentences = fullResponse.split('. ');
      for (let i = 0; i < sentences.length; i++) {
        const sentence = i === sentences.length - 1 ? sentences[i] : sentences[i] + '. ';
        const words = sentence.split(' ');
        
        for (let j = 0; j < words.length; j++) {
          const chunk = (j === 0 && i === 0) ? words[j] : ' ' + words[j];
          onStream(chunk);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Pause between sentences
        }
      }
    }

    return fullResponse;
  }

  buildMessages(userMessage: string, context?: string, recentMessages: any[] = []): GroqMessage[] {
    const messages: GroqMessage[] = [];

    // Ultra-concise system prompt - maximum 40 words
    let systemPrompt = `You are VelariAI. Give VERY short answers (30-40 words max).

Start with "Sure!" or "Absolutely!" then give ONE key point. Stop immediately.

NO formatting, NO long explanations, NO multiple sentences.`;
    
    if (context) {
      systemPrompt += `\n\nYour Professional Background:\n${context}\n\nIMPORTANT CONTEXT RULES:
- Only mention your experience when it's directly relevant to the question
- Don't force connections between questions and your background
- If your experience relates naturally, mention it briefly using "I" statements
- Answer the question first, then add relevant experience if it helps
- Stay within 150 words total including any experience references`;
    } else {
      systemPrompt += `\n\nYou are helping with general interview preparation. Respond as a confident software engineer would speak in an interview. Use practical examples and "I" statements. Structure answers clearly with short paragraphs. Avoid theoretical explanations unless specifically requested.`;
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
