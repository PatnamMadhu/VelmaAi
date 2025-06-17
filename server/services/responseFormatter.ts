import { QuestionAnalyzer } from './questionAnalyzer';

interface QuestionAnalysis {
  questionType: {
    type: 'technical' | 'behavioral' | 'system_design' | 'coding' | 'general';
    category: string;
    confidence: number;
    suggestedFormat: 'definition' | 'star' | 'architecture' | 'step_by_step' | 'comparison';
  };
  keywords: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  requiresContext: boolean;
}

interface STARComponents {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface FormattedResponse {
  content: string;
  structure: string;
  followUpSuggestions: string[];
  timeToDeliver: number;
}

export class ResponseFormatter {
  formatResponse(
    analysis: QuestionAnalysis,
    rawResponse: string,
    context?: string
  ): FormattedResponse {
    switch (analysis.questionType.suggestedFormat) {
      case 'star':
        return this.formatSTARResponse(rawResponse, analysis);
      case 'definition':
        return this.formatTechnicalResponse(rawResponse, analysis);
      case 'comparison':
        return this.formatComparisonResponse(rawResponse, analysis);
      case 'architecture':
        return this.formatSystemDesignResponse(rawResponse, analysis);
      case 'step_by_step':
        return this.formatCodingResponse(rawResponse, analysis);
      default:
        return this.formatGeneralResponse(rawResponse, analysis);
    }
  }

  private formatSTARResponse(response: string, analysis: QuestionAnalysis): FormattedResponse {
    // Extract STAR components from response or create structure
    const starComponents = this.extractSTARComponents(response);
    
    const formattedContent = `**Situation**: ${starComponents.situation}

**Task**: ${starComponents.task}

**Action**: ${starComponents.action}

**Result**: ${starComponents.result}`;

    const followUpSuggestions = [
      "Can you tell me about another challenging situation?",
      "How do you handle conflict in team settings?",
      "Describe your leadership style with an example",
      "What's your approach to giving feedback?"
    ];

    return {
      content: formattedContent,
      structure: 'STAR Format',
      followUpSuggestions,
      timeToDeliver: analysis.estimatedTime
    };
  }

  private formatTechnicalResponse(response: string, analysis: QuestionAnalysis): FormattedResponse {
    const sections = this.parseTechnicalContent(response);
    
    let formattedContent = '';
    
    if (sections.definition) {
      formattedContent += `**Definition**: ${sections.definition}\n\n`;
    }
    
    if (sections.keyPoints.length > 0) {
      formattedContent += `**Key Points**:\n${sections.keyPoints.map(point => `• ${point}`).join('\n')}\n\n`;
    }
    
    if (sections.example) {
      formattedContent += `**Example**: ${sections.example}\n\n`;
    }
    
    if (sections.practical) {
      formattedContent += `**Practical Application**: ${sections.practical}`;
    }

    const followUpSuggestions = [
      `How would you implement ${analysis.keywords[0]} in a real project?`,
      `What are common pitfalls with ${analysis.keywords[0]}?`,
      `Can you compare this with alternative approaches?`,
      "Tell me about your experience using this technology"
    ];

    return {
      content: formattedContent.trim(),
      structure: 'Technical Explanation',
      followUpSuggestions,
      timeToDeliver: analysis.estimatedTime
    };
  }

  private formatComparisonResponse(response: string, analysis: QuestionAnalysis): FormattedResponse {
    const comparison = this.parseComparisonContent(response);
    
    const formattedContent = `**Overview**: ${comparison.overview}

**Option A**:
${comparison.optionA.map(point => `• ${point}`).join('\n')}

**Option B**:
${comparison.optionB.map(point => `• ${point}`).join('\n')}

**Best Use Cases**:
${comparison.useCases.map(point => `• ${point}`).join('\n')}

**Recommendation**: ${comparison.recommendation}`;

    const followUpSuggestions = [
      "Which approach would you choose for a high-traffic application?",
      "What factors influence your technology choice decisions?",
      "Have you worked with both of these technologies?",
      "What are the performance implications of each approach?"
    ];

    return {
      content: formattedContent,
      structure: 'Comparison Analysis',
      followUpSuggestions,
      timeToDeliver: analysis.estimatedTime
    };
  }

  private formatSystemDesignResponse(response: string, analysis: QuestionAnalysis): FormattedResponse {
    const design = this.parseSystemDesignContent(response);
    
    const formattedContent = `**High-Level Architecture**: ${design.overview}

**Core Components**:
${design.components.map(comp => `• **${comp.name}**: ${comp.description}`).join('\n')}

**Data Flow**:
${design.dataFlow.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Scalability Considerations**:
${design.scalability.map(point => `• ${point}`).join('\n')}

**Technology Stack**: ${design.techStack.join(', ')}`;

    const followUpSuggestions = [
      "How would you handle system failures in this design?",
      "What monitoring and alerting would you implement?",
      "How would you scale this to handle 10x more traffic?",
      "What security considerations are important here?"
    ];

    return {
      content: formattedContent,
      structure: 'System Design',
      followUpSuggestions,
      timeToDeliver: analysis.estimatedTime
    };
  }

  private formatCodingResponse(response: string, analysis: QuestionAnalysis): FormattedResponse {
    const coding = this.parseCodingContent(response);
    
    const formattedContent = `**Approach**: ${coding.approach}

**Algorithm**:
${coding.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Code Implementation**:
\`\`\`${coding.language}
${coding.code}
\`\`\`

**Time Complexity**: ${coding.timeComplexity}
**Space Complexity**: ${coding.spaceComplexity}

**Edge Cases**: ${coding.edgeCases.join(', ')}`;

    const followUpSuggestions = [
      "How would you optimize this solution further?",
      "What if the input constraints were different?",
      "Can you solve this using a different approach?",
      "How would you test this implementation?"
    ];

    return {
      content: formattedContent,
      structure: 'Coding Solution',
      followUpSuggestions,
      timeToDeliver: analysis.estimatedTime
    };
  }

  private formatGeneralResponse(response: string, analysis: QuestionAnalysis): FormattedResponse {
    const followUpSuggestions = [
      "Can you elaborate on that point?",
      "How does this relate to your experience?",
      "What would you do in a similar situation?",
      "Are there alternative approaches to consider?"
    ];

    return {
      content: response,
      structure: 'General Discussion',
      followUpSuggestions,
      timeToDeliver: analysis.estimatedTime
    };
  }

  private extractSTARComponents(response: string): STARComponents {
    // Try to identify STAR components from the response using simpler patterns
    const situationKeywords = ['situation', 'context', 'background'];
    const taskKeywords = ['task', 'challenge', 'goal', 'objective'];
    const actionKeywords = ['action', 'steps', 'approach', 'solution'];
    const resultKeywords = ['result', 'outcome', 'impact', 'achievement'];
    
    const findSection = (keywords: string[], text: string) => {
      for (const keyword of keywords) {
        const index = text.toLowerCase().indexOf(keyword + ':');
        if (index !== -1) {
          const start = index + keyword.length + 1;
          const nextKeywordIndex = Math.min(
            ...['task', 'action', 'result', 'situation'].map(k => text.toLowerCase().indexOf(k + ':', start))
              .filter(i => i > start)
          );
          const end = nextKeywordIndex === Infinity ? text.length : nextKeywordIndex;
          return text.substring(start, end).trim();
        }
      }
      return null;
    };
    
    const situationMatch = findSection(situationKeywords, response);
    const taskMatch = findSection(taskKeywords, response);
    const actionMatch = findSection(actionKeywords, response);
    const resultMatch = findSection(resultKeywords, response);

    // If structured components aren't found, create them from the response
    if (!situationMatch && !taskMatch && !actionMatch && !resultMatch) {
      const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const quarter = Math.ceil(sentences.length / 4);
      
      return {
        situation: sentences.slice(0, quarter).join('. ').trim() + '.',
        task: sentences.slice(quarter, quarter * 2).join('. ').trim() + '.',
        action: sentences.slice(quarter * 2, quarter * 3).join('. ').trim() + '.',
        result: sentences.slice(quarter * 3).join('. ').trim() + '.'
      };
    }

    return {
      situation: situationMatch || "In a previous role, I encountered a situation that required careful handling.",
      task: taskMatch || "My objective was to resolve the issue while maintaining team productivity.",
      action: actionMatch || "I took a systematic approach, focusing on clear communication and collaboration.",
      result: resultMatch || "The outcome was successful, leading to improved processes and team satisfaction."
    };
  }

  private parseTechnicalContent(response: string): {
    definition: string;
    keyPoints: string[];
    example: string;
    practical: string;
  } {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    return {
      definition: sentences[0]?.trim() + '.' || '',
      keyPoints: sentences.slice(1, 4).map(s => s.trim()).filter(s => s),
      example: sentences.find(s => s.toLowerCase().includes('example') || s.toLowerCase().includes('for instance'))?.trim() || '',
      practical: sentences[sentences.length - 1]?.trim() + '.' || ''
    };
  }

  private parseComparisonContent(response: string): {
    overview: string;
    optionA: string[];
    optionB: string[];
    useCases: string[];
    recommendation: string;
  } {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const midpoint = Math.ceil(sentences.length / 2);
    
    return {
      overview: sentences[0]?.trim() + '.' || '',
      optionA: sentences.slice(1, 3).map(s => s.trim()).filter(s => s),
      optionB: sentences.slice(3, 5).map(s => s.trim()).filter(s => s),
      useCases: sentences.slice(5, 7).map(s => s.trim()).filter(s => s),
      recommendation: sentences[sentences.length - 1]?.trim() + '.' || ''
    };
  }

  private parseSystemDesignContent(response: string): {
    overview: string;
    components: Array<{name: string; description: string}>;
    dataFlow: string[];
    scalability: string[];
    techStack: string[];
  } {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    return {
      overview: sentences[0]?.trim() + '.' || '',
      components: [
        { name: 'Frontend', description: 'User interface and client-side logic' },
        { name: 'API Gateway', description: 'Request routing and authentication' },
        { name: 'Backend Services', description: 'Business logic and data processing' },
        { name: 'Database', description: 'Data storage and retrieval' }
      ],
      dataFlow: sentences.slice(1, 4).map(s => s.trim()).filter(s => s),
      scalability: sentences.slice(4, 6).map(s => s.trim()).filter(s => s),
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS']
    };
  }

  private parseCodingContent(response: string): {
    approach: string;
    steps: string[];
    code: string;
    language: string;
    timeComplexity: string;
    spaceComplexity: string;
    edgeCases: string[];
  } {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    return {
      approach: sentences[0]?.trim() + '.' || '',
      steps: sentences.slice(1, 4).map(s => s.trim()).filter(s => s),
      code: '// Implementation would go here\nfunction solution() {\n  // Code logic\n}',
      language: 'javascript',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      edgeCases: ['Empty input', 'Null values', 'Edge boundaries']
    };
  }
}

export const responseFormatter = new ResponseFormatter();