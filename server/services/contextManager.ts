import { Message } from "@shared/schema";

interface ContextualResponse {
  isFollowUp: boolean;
  contextType: 'continuation' | 'clarification' | 'new_topic';
  relevantHistory: Message[];
  focusedPrompt: string;
}

export class ContextManager {
  
  analyzeMessageContext(
    currentMessage: string, 
    recentMessages: Message[], 
    userContext?: string
  ): ContextualResponse {
    const lastTwoMessages = recentMessages.slice(-2);
    const isFollowUp = this.detectFollowUpQuestion(currentMessage, lastTwoMessages);
    
    if (!isFollowUp) {
      return {
        isFollowUp: false,
        contextType: 'new_topic',
        relevantHistory: [],
        focusedPrompt: this.buildFreshTopicPrompt(currentMessage, userContext)
      };
    }

    const contextType = this.determineContextType(currentMessage, lastTwoMessages);
    const relevantHistory = this.selectRelevantHistory(currentMessage, lastTwoMessages);
    const focusedPrompt = this.buildContextualPrompt(currentMessage, relevantHistory, userContext, contextType);

    return {
      isFollowUp: true,
      contextType,
      relevantHistory,
      focusedPrompt
    };
  }

  private detectFollowUpQuestion(message: string, recentMessages: Message[]): boolean {
    if (recentMessages.length === 0) return false;

    const followUpIndicators = [
      // Direct references
      'what about', 'how about', 'what if', 'and what', 'also',
      
      // Continuation words
      'furthermore', 'additionally', 'moreover', 'besides', 'in addition',
      
      // Clarification requests
      'can you explain', 'could you clarify', 'what do you mean', 'how does',
      'tell me more', 'elaborate on', 'expand on',
      
      // Comparison requests
      'compared to', 'versus', 'difference between', 'instead of',
      
      // Extension requests
      'any other', 'more about', 'further details', 'what else',
      
      // Specific follow-ups
      'in that case', 'then how', 'but what', 'however',
      
      // Project/experience continuations
      'in that project', 'during that', 'when you', 'how did you',
      'in your experience', 'at your previous', 'in your role'
    ];

    const messageLower = message.toLowerCase().trim();
    
    // Filter out garbled or repetitive voice input that might contain follow-up words
    if (messageLower.length < 5 || this.isGarbledInput(messageLower)) {
      return false;
    }
    
    // Check for direct follow-up indicators
    const hasFollowUpWords = followUpIndicators.some(indicator => 
      messageLower.includes(indicator)
    );

    // Check for pronoun references that suggest continuation
    const pronounReferences = ['that', 'this', 'it', 'they', 'those', 'these'];
    const hasPronounReference = pronounReferences.some(pronoun => 
      messageLower.includes(` ${pronoun} `) || messageLower.startsWith(`${pronoun} `)
    );

    // Check for question words that suggest building on previous context
    const buildingQuestions = ['why', 'how', 'when', 'where', 'which'];
    const hasBuildingQuestion = buildingQuestions.some(word => 
      messageLower.startsWith(word)
    ) && messageLower.length < 50; // Short questions are more likely to be follow-ups

    return hasFollowUpWords || hasPronounReference || hasBuildingQuestion;
  }

  private isGarbledInput(message: string): boolean {
    // Check for repetitive patterns that suggest voice recognition errors
    const words = message.split(' ');
    const uniqueWords = new Set(words);
    
    // If more than 50% of words are repeated, likely garbled
    if (uniqueWords.size / words.length < 0.5) {
      return true;
    }
    
    // Check for common voice recognition artifacts
    const artifacts = ['um', 'uh', 'ah', 'er', 'hmm'];
    const artifactCount = words.filter(word => artifacts.includes(word)).length;
    
    return artifactCount / words.length > 0.3; // More than 30% artifacts
  }

  private determineContextType(message: string, recentMessages: Message[]): 'continuation' | 'clarification' | 'new_topic' {
    const messageLower = message.toLowerCase();

    // Clarification indicators
    const clarificationWords = [
      'explain', 'clarify', 'what do you mean', 'how does', 'why',
      'could you elaborate', 'can you expand', 'more details'
    ];

    if (clarificationWords.some(word => messageLower.includes(word))) {
      return 'clarification';
    }

    // Continuation indicators
    const continuationWords = [
      'what about', 'how about', 'also', 'and', 'furthermore',
      'in addition', 'moreover', 'next', 'then'
    ];

    if (continuationWords.some(word => messageLower.includes(word))) {
      return 'continuation';
    }

    return 'new_topic';
  }

  private selectRelevantHistory(message: string, recentMessages: Message[]): Message[] {
    // For follow-up questions, use the most recent exchange (last question and answer)
    if (recentMessages.length >= 2) {
      return recentMessages.slice(-2);
    }
    return recentMessages;
  }

  private buildFreshTopicPrompt(message: string, userContext?: string): string {
    return `You are VelariAI, a specialized AI interview assistant. This is a new topic/question.

${userContext ? `CANDIDATE CONTEXT:\n${userContext}\n\nIMPORTANT: Use this context to personalize your answer. Reference specific projects, technologies, or experiences from your background that relate to the question. Speak as this candidate with their actual experience.\n` : ''}

Provide a focused, interview-appropriate response that demonstrates expertise and practical experience.`;
  }

  private buildContextualPrompt(
    message: string, 
    relevantHistory: Message[], 
    userContext?: string, 
    contextType: string
  ): string {
    const basePrompt = `You are VelariAI, a specialized AI interview assistant. This is a ${contextType} question building on the recent conversation.

RECENT CONVERSATION CONTEXT:
${relevantHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

CURRENT ${contextType.toUpperCase()} QUESTION: ${message}

${userContext ? `CANDIDATE CONTEXT:\n${userContext}\n\nIMPORTANT: Use this context to personalize your answer. Reference specific projects, technologies, or experiences from your background that relate to the question.\n` : ''}`;

    switch (contextType) {
      case 'clarification':
        return basePrompt + `
Provide a clear, detailed clarification that builds on your previous response. Focus on explaining the specific aspect the interviewer is asking about.`;

      case 'continuation':
        return basePrompt + `
Continue the discussion naturally, building on the previous topic. Provide additional relevant information or explore the next logical aspect.`;

      default:
        return basePrompt + `
Respond appropriately to this follow-up while maintaining conversation flow.`;
    }
  }
}

export const contextManager = new ContextManager();