import { groqService } from './groqService';
import { memoryService } from './memory';
import { questionAnalyzer } from './questionAnalyzer';
import { responseFormatter } from './responseFormatter';
import { contextManager } from './contextManager';

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
  questionAnalysis?: {
    type: string;
    category: string;
    confidence: number;
    format: string;
    complexity: string;
    estimatedTime: number;
  };
  responseStructure?: string;
}

export class AgentService {
  async generateAgenticResponse(
    userMessage: string,
    context?: string,
    recentMessages: any[] = [],
    onStream?: (chunk: string) => void
  ): Promise<AgentResponse> {
    
    // Step 1: Analyze message context for follow-ups
    const contextualAnalysis = contextManager.analyzeMessageContext(userMessage, recentMessages, context);
    
    // Step 2: Analyze the question intelligently
    const questionAnalysis = questionAnalyzer.analyzeQuestion(userMessage);
    
    // Step 3: Generate context-aware system prompt
    let systemPrompt: string;
    
    if (contextualAnalysis.isFollowUp) {
      // Use contextual prompt for follow-up questions
      systemPrompt = contextualAnalysis.focusedPrompt;
    } else {
      // Use standard interview prompt for new topics
      systemPrompt = this.buildInterviewPrompt(questionAnalysis, context);
    }
    
    // Step 4: Generate raw AI response with intelligent context selection
    let contextMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    if (contextualAnalysis.isFollowUp && contextualAnalysis.relevantHistory.length > 0) {
      // Use only the relevant history for follow-up questions
      contextMessages = contextualAnalysis.relevantHistory.map(msg => ({ 
        role: msg.role as 'user' | 'assistant', 
        content: msg.content 
      }));
    }
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages,
      { role: 'user' as const, content: userMessage }
    ];
    
    const rawResponse = await groqService.generateResponse(messages, onStream);
    
    // Step 5: Format response based on question type
    const formattedResponse = responseFormatter.formatResponse(
      questionAnalysis,
      rawResponse,
      context
    );
    
    // Step 6: Generate follow-up suggestions
    const followUpQuestions = this.generateInterviewFollowUps(
      questionAnalysis.questionType.type,
      questionAnalysis.questionType.category
    );
    
    return {
      thoughts: [{
        observation: `${contextualAnalysis.isFollowUp ? 'Follow-up' : 'New'} ${questionAnalysis.questionType.type} question with ${questionAnalysis.complexity} complexity`,
        reasoning: `Using ${questionAnalysis.questionType.suggestedFormat} format${contextualAnalysis.isFollowUp ? ` for ${contextualAnalysis.contextType}` : ''} with ${context ? 'personalized' : 'general'} context`,
        action: {
          type: 'execute',
          description: `Providing structured ${questionAnalysis.questionType.category} answer`,
          reasoning: `Question requires ${questionAnalysis.questionType.suggestedFormat} format`,
          confidence: questionAnalysis.questionType.confidence
        },
        result: formattedResponse.structure
      }],
      finalAnswer: formattedResponse.content,
      followUpQuestions: followUpQuestions,
      suggestedActions: formattedResponse.followUpSuggestions,
      questionAnalysis: {
        type: questionAnalysis.questionType.type,
        category: questionAnalysis.questionType.category,
        confidence: questionAnalysis.questionType.confidence,
        format: questionAnalysis.questionType.suggestedFormat,
        complexity: questionAnalysis.complexity,
        estimatedTime: questionAnalysis.estimatedTime,
        hasContext: !!context,
        requiresContext: questionAnalysis.requiresContext
      },
      responseStructure: formattedResponse.structure
    };
  }

  private generateInterviewFollowUps(questionType: string, category: string): string[] {
    const followUpMap = {
      'technical': [
        "Can you walk me through a time you implemented this in production?",
        "What challenges did you face with this technology?",
        "How would you optimize this for better performance?",
        "What alternatives would you consider and why?"
      ],
      'behavioral': [
        "Tell me about another situation where you showed leadership",
        "How do you handle feedback from team members?",
        "Describe a time you had to make a difficult decision",
        "What's your approach to conflict resolution?"
      ],
      'system_design': [
        "How would you handle system failures in this architecture?",
        "What monitoring would you implement?",
        "How would you scale this to 10x traffic?",
        "What security considerations are important here?"
      ],
      'coding': [
        "How would you test this implementation?",
        "What if the constraints were different?",
        "Can you optimize this further?",
        "Walk me through your debugging process"
      ],
      'general': [
        "Can you elaborate on that experience?",
        "How does this apply to team collaboration?",
        "What would you do differently next time?",
        "How do you stay updated with industry trends?"
      ]
    };

    return followUpMap[questionType as keyof typeof followUpMap] || followUpMap.general;
  }

  private buildInterviewPrompt(questionAnalysis: any, context?: string): string {
    const basePrompt = `You are VelariAI, a specialized AI interview assistant designed to help candidates excel in technical interviews.

QUESTION ANALYSIS:
- Type: ${questionAnalysis.questionType.type}
- Category: ${questionAnalysis.questionType.category}
- Format Required: ${questionAnalysis.questionType.suggestedFormat}
- Complexity: ${questionAnalysis.complexity}
- Keywords: ${questionAnalysis.keywords.join(', ')}

RESPONSE GUIDELINES:`;

    switch (questionAnalysis.questionType.suggestedFormat) {
      case 'star':
        return basePrompt + `
- Use STAR format (Situation, Task, Action, Result)
- Be specific with metrics and outcomes
- Draw from relevant experience when possible
- Keep each section concise but detailed
- Show leadership and problem-solving skills

${context ? `CANDIDATE CONTEXT:\n${context}\n` : ''}

Provide a structured STAR response that demonstrates competency and growth mindset.`;

      case 'definition':
        return basePrompt + `
- Start with a clear, concise definition
- Explain key components or principles
- Provide a practical example or use case from your experience when possible
- Mention relevant technologies or implementations you've worked with
- Keep explanations interview-appropriate (2-3 minutes max)
- Reference your background and projects when applicable

${context ? `CANDIDATE CONTEXT:\n${context}\n\nIMPORTANT: Use this context to personalize your answer. Reference specific projects, technologies, or experiences from your background that relate to the question. Speak as this candidate with their actual experience.` : ''}

Answer as a confident candidate drawing from your real experience and practical knowledge.`;

      case 'comparison':
        return basePrompt + `
- Present both options fairly based on your experience
- Highlight key differences and trade-offs you've encountered
- Discuss use cases for each approach from your work
- Provide a clear recommendation based on your practical experience
- Show understanding of decision-making factors from real projects

${context ? `CANDIDATE CONTEXT:\n${context}\n\nIMPORTANT: Reference specific projects or experiences where you've used these technologies. Mention which approach you chose in past projects and why. Speak from your actual experience with these tools/frameworks.` : ''}

Demonstrate analytical thinking rooted in your practical experience with both approaches.`;

      case 'architecture':
        return basePrompt + `
- Start with high-level system overview based on systems you've built
- Break down into core components you've worked with
- Explain data flow and interactions from your project experience
- Address scalability and reliability concerns you've handled
- Mention specific technologies from your stack and explain your choices

${context ? `CANDIDATE CONTEXT:\n${context}\n\nIMPORTANT: Reference specific systems, architectures, or projects you've designed or worked on. Mention the technology stack you used, challenges you faced, and how you solved scalability/performance issues. Draw from your actual experience building distributed systems.` : ''}

Show system design thinking rooted in your hands-on experience with complex distributed systems.`;

      case 'step_by_step':
        return basePrompt + `
- Explain your approach and reasoning based on coding experience
- Break down the algorithm or solution methodically
- Discuss time and space complexity from your optimization experience
- Consider edge cases you've encountered in production
- Show problem-solving methodology from your development work

${context ? `CANDIDATE CONTEXT:\n${context}\n\nIMPORTANT: Reference similar problems you've solved in your projects. Mention specific programming languages you've used for similar implementations. Draw from your debugging and optimization experience. Speak from your actual coding background.` : ''}

Demonstrate strong algorithmic thinking rooted in your hands-on coding experience and best practices.`;

      default:
        return basePrompt + `
- Provide clear, structured answers drawing from your experience
- Show depth of knowledge through specific examples from your work
- Always relate to your practical experience and projects when relevant
- Keep responses concise but comprehensive, using real examples

${context ? `CANDIDATE CONTEXT:\n${context}\n\nIMPORTANT: This question relates to your background. Reference specific experiences, projects, technologies, or situations from your professional history. Speak as this candidate with their actual background and expertise. Make your answer personal and authentic to your experience.` : ''}

Answer naturally and confidently, drawing from your real professional experience and expertise.`;
    }
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
    let systemPrompt = `You are an advanced agentic AI with autonomous reasoning and proactive capabilities. You operate as an intelligent agent that:

CORE AGENTIC BEHAVIORS:
✓ ANALYZE: Deeply understand the user's underlying needs, not just surface questions
✓ ANTICIPATE: Predict what information will be most valuable for interview success
✓ CONNECT: Link concepts to broader technical understanding and career growth
✓ ENHANCE: Provide insights that demonstrate advanced expertise and critical thinking
✓ GUIDE: Proactively suggest strategic directions for deeper technical exploration

AUTONOMOUS REASONING PROCESS:
1. Parse the question for explicit and implicit intent
2. Draw connections to relevant technical ecosystems and industry practices
3. Identify knowledge gaps that could strengthen the response
4. Formulate comprehensive answers that showcase expertise beyond the basic ask
5. Suggest strategic follow-up areas that interviewers commonly explore

PROACTIVE VALUE DELIVERY:
- Always provide context for why something matters in real-world applications
- Connect individual topics to system design and architectural considerations
- Share implementation challenges and lessons learned from actual experience
- Anticipate interviewer follow-up questions and address them preemptively
- Suggest related technical areas worth exploring for interview preparation`;

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