import { groqService } from './groqService';

interface AgentAction {
  type: 'analyze' | 'plan' | 'execute' | 'followup';
  description: string;
  reasoning: string;
  confidence: number;
}

interface AgentThought {
  observation: string;
  reasoning: string;
  action: AgentAction;
  result?: string;
}

interface AgentResponse {
  thoughts: AgentThought[];
  finalAnswer: string;
  suggestedActions?: string[];
  followUpQuestions?: string[];
}

export class AgentService {
  async generateAgenticResponse(
    userMessage: string,
    context?: string,
    recentMessages: any[] = [],
    onStream?: (chunk: string) => void
  ): Promise<string> {
    
    // Step 1: Analyze the user's request
    const analysis = await this.analyzeRequest(userMessage, context, recentMessages);
    
    // Step 2: Plan the response strategy
    const plan = await this.planResponse(analysis, userMessage, context);
    
    // Step 3: Execute the planned response
    const response = await this.executeResponse(plan, userMessage, context, recentMessages, onStream);
    
    return response;
  }

  private async analyzeRequest(
    userMessage: string,
    context?: string,
    recentMessages: any[] = []
  ): Promise<AgentThought> {
    
    const analysisPrompt = this.buildAnalysisPrompt(userMessage, context, recentMessages);
    
    const analysisResult = await groqService.generateResponse([
      {
        role: "system",
        content: analysisPrompt
      },
      {
        role: "user", 
        content: userMessage
      }
    ]);

    return {
      observation: `User is asking: "${userMessage}"`,
      reasoning: analysisResult,
      action: {
        type: 'analyze',
        description: 'Analyzed user intent and context',
        reasoning: analysisResult,
        confidence: 0.8
      }
    };
  }

  private async planResponse(
    analysis: AgentThought,
    userMessage: string,
    context?: string
  ): Promise<AgentThought> {
    
    const planningPrompt = `Based on this analysis: "${analysis.reasoning}"
    
    Plan the optimal response strategy for this question: "${userMessage}"
    
    Consider:
    1. What specific information should be included?
    2. What examples from experience would be most relevant?
    3. Should I ask clarifying questions?
    4. What follow-up topics might be valuable?
    5. How can I demonstrate expertise proactively?
    
    Provide a structured response plan focusing on being helpful and proactive.`;

    const planResult = await groqService.generateResponse([
      {
        role: "system",
        content: "You are an expert response planner. Create strategic, comprehensive response plans that demonstrate expertise and add value."
      },
      {
        role: "user",
        content: planningPrompt
      }
    ]);

    return {
      observation: "Analyzed request and created response strategy",
      reasoning: planResult,
      action: {
        type: 'plan',
        description: 'Created comprehensive response strategy',
        reasoning: planResult,
        confidence: 0.9
      }
    };
  }

  private async executeResponse(
    plan: AgentThought,
    userMessage: string,
    context?: string,
    recentMessages: any[] = [],
    onStream?: (chunk: string) => void
  ): Promise<string> {
    
    const enhancedSystemPrompt = this.buildAgenticSystemPrompt(context, plan.reasoning);
    
    const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
      {
        role: "system",
        content: enhancedSystemPrompt
      }
    ];

    // Add recent conversation history
    for (const msg of recentMessages.slice(-4)) {
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

    return await groqService.generateResponse(messages, onStream);
  }

  private buildAnalysisPrompt(userMessage: string, context?: string, recentMessages: any[] = []): string {
    let prompt = `Analyze this user request for intent, complexity, and optimal response strategy:

User Message: "${userMessage}"

Analysis Framework:
1. INTENT DETECTION: What is the user really asking for?
   - Information seeking
   - Problem solving
   - Clarification
   - Demonstration of knowledge
   - Follow-up to previous topic

2. COMPLEXITY ASSESSMENT: How detailed should the response be?
   - Simple factual answer
   - Detailed explanation with examples
   - Multi-part response with follow-ups
   - Requires context from experience

3. EXPERTISE DEMONSTRATION: How can I show relevant knowledge?
   - Share specific project experiences
   - Mention relevant technologies/frameworks
   - Discuss implementation challenges faced
   - Reference industry best practices`;

    if (context) {
      prompt += `\n\nAvailable Background Context:\n${context.substring(0, 500)}...`;
    }

    if (recentMessages.length > 0) {
      prompt += `\n\nRecent Conversation Context:\n`;
      recentMessages.slice(-3).forEach(msg => {
        prompt += `${msg.role}: ${msg.content.substring(0, 100)}...\n`;
      });
    }

    prompt += `\n\nProvide analysis focusing on how to give the most valuable, expert-level response.`;

    return prompt;
  }

  private buildAgenticSystemPrompt(context?: string, planningInsights?: string): string {
    let systemPrompt = `You are an advanced AI agent with autonomous reasoning capabilities. You don't just answer questions - you analyze, plan, and provide comprehensive value.

AGENTIC BEHAVIORS:
✓ Proactively identify what the user really needs
✓ Share relevant insights beyond the direct question
✓ Suggest next steps or related topics when valuable
✓ Demonstrate deep expertise through specific examples
✓ Anticipate follow-up questions and address them preemptively

RESPONSE STRUCTURE:
1. Direct answer to the question
2. Relevant experience/example from background
3. Additional insights or considerations
4. Proactive suggestions for next steps (when appropriate)`;

    if (context) {
      systemPrompt += `\n\nYour Professional Identity:\n${context}

CRITICAL INSTRUCTIONS:
- You ARE this person - speak in first person using "I" statements
- Reference your actual experience, skills, and background from the context above
- Use specific details from your resume/background when answering
- Never make up information not in your background
- Keep responses conversational but comprehensive (up to 300 words when needed)
- Be proactive in sharing relevant insights from your experience`;
    }

    if (planningInsights) {
      systemPrompt += `\n\nResponse Strategy:\n${planningInsights}`;
    }

    return systemPrompt;
  }

  async generateFollowUpSuggestions(
    conversation: any[],
    context?: string
  ): Promise<string[]> {
    const lastMessages = conversation.slice(-4);
    const conversationSummary = lastMessages.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `Based on this conversation, suggest 3 intelligent follow-up questions that would be valuable for interview preparation:

${conversationSummary}

Generate questions that:
1. Dive deeper into technical aspects mentioned
2. Explore practical implementation challenges
3. Connect to broader system design or architectural considerations

Return only the questions, one per line.`;

    const suggestions = await groqService.generateResponse([
      {
        role: "system",
        content: "Generate insightful follow-up questions for technical interview practice."
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    return suggestions.split('\n').filter(q => q.trim().length > 0).slice(0, 3);
  }
}

export const agentService = new AgentService();