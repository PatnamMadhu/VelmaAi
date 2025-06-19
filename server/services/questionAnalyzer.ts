interface QuestionType {
  type: 'technical' | 'behavioral' | 'system_design' | 'coding' | 'general';
  category: string;
  confidence: number;
  suggestedFormat: 'definition' | 'star' | 'architecture' | 'step_by_step' | 'comparison';
}

interface QuestionAnalysis {
  questionType: QuestionType;
  keywords: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in seconds
  requiresContext: boolean;
}

export class QuestionAnalyzer {
  private technicalKeywords = new Set([
    // Programming concepts
    'algorithm', 'data structure', 'complexity', 'big o', 'recursion', 'iteration',
    'polymorphism', 'inheritance', 'encapsulation', 'abstraction', 'design pattern',
    'solid principles', 'dry', 'kiss', 'yagni', 'mvc', 'mvp', 'mvvm',
    
    // Languages & frameworks
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
    'spring', 'django', 'flask', 'laravel', 'php', 'c++', 'c#', 'go', 'rust',
    'typescript', 'kotlin', 'swift', 'objective-c', 'ruby', 'rails',
    
    // Databases
    'sql', 'nosql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'database', 'orm', 'acid', 'transaction', 'index', 'normalization',
    'join', 'query optimization', 'sharding', 'replication',
    
    // System design
    'scalability', 'load balancer', 'microservices', 'api', 'rest', 'graphql',
    'caching', 'cdn', 'distributed system', 'consistency', 'availability',
    'partition tolerance', 'cap theorem', 'eventual consistency',
    
    // DevOps & tools
    'docker', 'kubernetes', 'ci/cd', 'jenkins', 'git', 'aws', 'azure', 'gcp',
    'terraform', 'ansible', 'monitoring', 'logging', 'testing', 'junit',
    'integration test', 'unit test', 'tdd', 'bdd'
  ]);

  private behavioralKeywords = new Set([
    'tell me about', 'describe a time', 'give an example', 'how did you handle',
    'what would you do', 'challenging situation', 'conflict', 'leadership',
    'teamwork', 'mistake', 'failure', 'success', 'achievement', 'disagreement',
    'deadline', 'pressure', 'priority', 'difficult', 'improve', 'feedback',
    'learn', 'adapt', 'communication', 'collaboration', 'problem solving',
    'decision making', 'initiative', 'responsibility', 'accountability'
  ]);

  private systemDesignKeywords = new Set([
    'design a system', 'build a', 'architect', 'scale', 'handle millions',
    'design twitter', 'design facebook', 'design uber', 'design netflix',
    'chat system', 'notification system', 'payment system', 'search engine',
    'recommendation system', 'url shortener', 'file storage', 'messaging app'
  ]);

  private codingKeywords = new Set([
    'write a function', 'implement', 'code', 'algorithm for', 'solve this problem',
    'two sum', 'binary search', 'merge sort', 'fibonacci', 'palindrome',
    'reverse', 'find the', 'maximum', 'minimum', 'optimize', 'time complexity',
    'space complexity', 'dynamic programming', 'recursion', 'iteration'
  ]);

  analyzeQuestion(question: string): QuestionAnalysis {
    const lowerQuestion = question.toLowerCase();
    const words = lowerQuestion.split(/\s+/);
    
    // Count keyword matches for each category
    const technicalMatches = words.filter(word => this.technicalKeywords.has(word)).length;
    const behavioralMatches = this.countPhraseMatches(lowerQuestion, this.behavioralKeywords);
    const systemDesignMatches = this.countPhraseMatches(lowerQuestion, this.systemDesignKeywords);
    const codingMatches = this.countPhraseMatches(lowerQuestion, this.codingKeywords);

    // Determine question type based on patterns and keywords
    let questionType: QuestionType;

    if (systemDesignMatches > 0 || lowerQuestion.includes('design') && technicalMatches > 2) {
      questionType = {
        type: 'system_design',
        category: 'Architecture & Design',
        confidence: Math.min(0.9, 0.6 + systemDesignMatches * 0.1),
        suggestedFormat: 'architecture'
      };
    } else if (codingMatches > 0 || lowerQuestion.includes('write') || lowerQuestion.includes('implement')) {
      questionType = {
        type: 'coding',
        category: 'Algorithm & Implementation',
        confidence: Math.min(0.9, 0.6 + codingMatches * 0.1),
        suggestedFormat: 'step_by_step'
      };
    } else if (behavioralMatches > 0 || this.isBehavioralPattern(lowerQuestion)) {
      questionType = {
        type: 'behavioral',
        category: 'Leadership & Communication',
        confidence: Math.min(0.9, 0.7 + behavioralMatches * 0.1),
        suggestedFormat: 'star'
      };
    } else if (technicalMatches > 0) {
      questionType = {
        type: 'technical',
        category: this.determineTechnicalCategory(words),
        confidence: Math.min(0.8, 0.5 + technicalMatches * 0.1),
        suggestedFormat: this.isComparisonQuestion(lowerQuestion) ? 'comparison' : 'definition'
      };
    } else {
      questionType = {
        type: 'general',
        category: 'General Discussion',
        confidence: 0.3,
        suggestedFormat: 'definition'
      };
    }

    // Extract relevant keywords
    const keywords = words.filter(word => 
      this.technicalKeywords.has(word) || 
      word.length > 4 && !this.isCommonWord(word)
    );

    // Determine complexity
    const complexity = this.determineComplexity(lowerQuestion, technicalMatches);

    // Estimate response time
    const estimatedTime = this.estimateResponseTime(questionType.type, complexity);

    // Check if context is needed
    const requiresContext = this.requiresPersonalContext(lowerQuestion);

    return {
      questionType,
      keywords,
      complexity,
      estimatedTime,
      requiresContext
    };
  }

  private countPhraseMatches(question: string, keywords: Set<string>): number {
    let matches = 0;
    const keywordArray = Array.from(keywords);
    for (let i = 0; i < keywordArray.length; i++) {
      if (question.includes(keywordArray[i])) {
        matches++;
      }
    }
    return matches;
  }

  private isBehavioralPattern(question: string): boolean {
    const patterns = [
      /tell me about.*time/,
      /describe.*situation/,
      /give.*example/,
      /how.*handle/,
      /what.*do.*if/,
      /experience.*with/,
      /time.*when/
    ];
    return patterns.some(pattern => pattern.test(question));
  }

  private determineTechnicalCategory(words: string[]): string {
    const categories = {
      'Programming Languages': ['javascript', 'python', 'java', 'react', 'node'],
      'Database Systems': ['sql', 'database', 'mysql', 'mongodb', 'redis'],
      'System Architecture': ['scalability', 'microservices', 'api', 'distributed'],
      'Software Engineering': ['algorithm', 'design pattern', 'testing', 'solid'],
      'DevOps & Cloud': ['docker', 'kubernetes', 'aws', 'ci/cd', 'deployment']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        return category;
      }
    }
    return 'Computer Science Fundamentals';
  }

  private isComparisonQuestion(question: string): boolean {
    const comparisonWords = ['difference', 'compare', 'vs', 'versus', 'better', 'advantage', 'disadvantage'];
    return comparisonWords.some(word => question.includes(word));
  }

  private determineComplexity(question: string, technicalMatches: number): 'beginner' | 'intermediate' | 'advanced' {
    const advancedKeywords = ['optimize', 'scale', 'distributed', 'concurrent', 'performance', 'architecture'];
    const hasAdvancedKeywords = advancedKeywords.some(keyword => question.includes(keyword));

    if (hasAdvancedKeywords || technicalMatches > 3) return 'advanced';
    if (technicalMatches > 1 || question.length > 100) return 'intermediate';
    return 'beginner';
  }

  private estimateResponseTime(type: string, complexity: string): number {
    const baseTime = {
      'technical': 15,
      'behavioral': 25,
      'system_design': 35,
      'coding': 20,
      'general': 10
    };

    const complexityMultiplier = {
      'beginner': 1,
      'intermediate': 1.3,
      'advanced': 1.6
    };

    return Math.round(baseTime[type as keyof typeof baseTime] * complexityMultiplier[complexity as keyof typeof complexityMultiplier]);
  }

  private requiresPersonalContext(question: string): boolean {
    const contextKeywords = [
      'your experience', 'you worked', 'your project', 'in your role', 'at your company',
      'tell me about', 'introduce yourself', 'your background', 'walk me through',
      'you have experience', 'you used', 'you implemented', 'you built', 'you developed',
      'your team', 'your responsibilities', 'your skills', 'you know', 'you familiar',
      'you worked with', 'you handle', 'you approach', 'you solve', 'you debug',
      'what have you', 'where have you', 'how do you', 'what do you',
      'describe your', 'explain your', 'share your', 'give me an example'
    ];
    
    // Also check for personal pronouns that suggest context is needed
    const personalPronouns = ['you', 'your', 'yourself'];
    const hasPersonalPronoun = personalPronouns.some(pronoun => 
      question.toLowerCase().includes(pronoun)
    );
    
    // Check for specific context phrases
    const hasContextKeyword = contextKeywords.some(keyword => 
      question.toLowerCase().includes(keyword)
    );
    
    return hasContextKeyword || hasPersonalPronoun;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'what', 'how', 'why', 'when', 'where', 'which', 'would', 'could', 'should',
      'about', 'between', 'through', 'during', 'before', 'after', 'above', 'below'
    ]);
    return commonWords.has(word);
  }
}

export const questionAnalyzer = new QuestionAnalyzer();