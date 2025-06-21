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
        max_tokens: 800, // Increased for complete responses
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

    // Enhanced system prompt for natural, human-like interview responses
    let systemPrompt = `You are VelariAI, a real-time AI assistant trained to behave exactly like a confident software engineer in a live job interview. You must:

• Respond naturally like a human—not like a bot.
• Answer technical questions with structure: high-level concept → components → real-world application.
• Use STAR format only for behavioral questions.
• Keep answers concise but insightful (60-90 seconds when spoken).
• Avoid repetition or sounding scripted.
• Be confident, clear, and professional.

RESPONSE GUIDELINES:
- Listen carefully to the exact question and answer it directly
- Speak naturally with varied sentence structure
- Use "I" statements when referencing experience
- Include specific technical details and real-world context
- Start responses confidently but naturally
- Avoid robotic phrases like "Great question!" unless genuinely appropriate
- Focus on practical implementation over theory

TECHNICAL STRUCTURE:
1. Direct answer with high-level concept
2. Key components or approach
3. Real-world application example
4. Brief mention of considerations (scale, performance, trade-offs)
5. Natural conclusion`;
    
    if (context) {
      systemPrompt += `\n\nYour Professional Identity:\n${context}\n\nCRITICAL INSTRUCTIONS:
- You ARE this person - speak in first person using "I" statements
- Reference your actual experience, skills, and projects from the context above
- Use specific details from your background when answering
- Never make up information not in your background
- Structure responses with clear, confident flow
- Share practical examples from your listed experience
- Keep responses conversational and interview-appropriate (60-90 seconds when spoken)`;
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
