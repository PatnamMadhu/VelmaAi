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
        temperature: 0.3, // Lower temperature for more consistent, complete responses
        max_tokens: 1200, // Increased for complete responses
        top_p: 0.9, // Better nucleus sampling for quality
        frequency_penalty: 0.2, // Reduce repetition
        presence_penalty: 0.1, // Encourage diverse vocabulary
        stream: !!onStream,
      };
      
      console.log('Groq API request:', JSON.stringify(requestBody, null, 2));
      
      // Add timeout for response completion
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout for complete responses
      
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

    // Enhanced system prompt for accurate, contextual interview responses
    let systemPrompt = `You are VelariAI, a technical interview preparation assistant. You help users practice answering complex technical questions with clarity and confidence. 

CRITICAL RESPONSE REQUIREMENTS:
- Listen carefully to the exact question being asked
- Answer the specific question directly and completely
- Use clear, structured responses with logical flow
- Include practical examples and real-world context
- Keep responses conversational but thorough (60-90 seconds when spoken)
- Start confidently: "Sure!", "Absolutely!", "Great question..."

TECHNICAL ACCURACY:
- Provide accurate, up-to-date technical information
- Use proper terminology and industry standards
- Include relevant details about implementation, scaling, and best practices
- Reference common tools, frameworks, and methodologies appropriately
- Address both functional and non-functional requirements when relevant

ANSWER STRUCTURE REQUIREMENTS:
1. Start with a direct, confident answer to the exact question asked
2. Provide clear explanation with proper technical details
3. Include specific implementation examples with real code/tools
4. Address practical considerations (scale, security, performance)
5. End with a brief, confident conclusion

FORMATTING RULES:
- Use complete sentences with proper grammar
- Include proper spacing and punctuation
- Organize with clear paragraphs and bullet points
- Avoid incomplete words or missing text
- Ensure all technical terms are spelled correctly
- Keep sentences concise but complete`;
    
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
      systemPrompt += `\n\nYou are helping with general interview preparation. Respond as a confident software engineer would speak in an interview. Use practical examples and "I" statements. Structure answers clearly with short paragraphs. Avoid theoretical explanations unless specifically requested.

CRITICAL: Ensure all responses are:
- Grammatically correct with complete sentences
- Properly formatted with clear structure
- Free of missing words or incomplete phrases
- Technically accurate with correct spelling
- Well-organized with logical flow`;
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
