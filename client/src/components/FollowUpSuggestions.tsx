import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Lightbulb, MessageCircle, ArrowRight } from 'lucide-react';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  questionType?: string;
  onSuggestionClick: (suggestion: string) => void;
  isVisible?: boolean;
}

export function FollowUpSuggestions({ 
  suggestions, 
  questionType, 
  onSuggestionClick, 
  isVisible = true 
}: FollowUpSuggestionsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isVisible || !suggestions || suggestions.length === 0) return null;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'technical': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'behavioral': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'system_design': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'coding': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
      default: return 'from-[#00D9FF]/10 to-[#7C3AED]/10 border-[#00D9FF]/20';
    }
  };

  return (
    <Card className={`bg-gradient-to-r ${getTypeColor(questionType)} backdrop-blur-lg border shadow-lg animate-fade-in`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#FFFFFF] flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-[#00D9FF]" />
            <span>Follow-up Questions</span>
          </CardTitle>
          {questionType && (
            <Badge className="text-xs bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/30">
              {questionType.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
        <p className="text-xs text-[#A1A1AA]">
          Practice deeper with these interview-style follow-ups
        </p>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-2">
        {suggestions.slice(0, 4).map((suggestion, index) => (
          <div
            key={index}
            className="group relative"
            onMouseEnter={() => setExpandedIndex(index)}
            onMouseLeave={() => setExpandedIndex(null)}
          >
            <Button
              variant="ghost"
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full justify-start text-left h-auto p-3 bg-[#27272A]/60 hover:bg-[#27272A] border border-[#3F3F46]/30 hover:border-[#00D9FF]/30 transition-all duration-200 group-hover:transform group-hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-3 w-full">
                <MessageCircle className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#00D9FF] transition-colors mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#FFFFFF] group-hover:text-[#00D9FF] transition-colors leading-relaxed">
                    {suggestion}
                  </p>
                  {expandedIndex === index && (
                    <div className="mt-2 p-2 bg-[#0F0F0F]/80 rounded border border-[#00D9FF]/20 animate-fade-in">
                      <p className="text-xs text-[#A1A1AA]">
                        {questionType === 'behavioral' && 
                          "Use STAR format: Situation, Task, Action, Result"}
                        {questionType === 'technical' && 
                          "Focus on practical experience and implementation details"}
                        {questionType === 'system_design' && 
                          "Consider scalability, reliability, and trade-offs"}
                        {questionType === 'coding' && 
                          "Explain your approach, complexity, and optimizations"}
                        {(!questionType || questionType === 'general') && 
                          "Provide specific examples and demonstrate expertise"}
                      </p>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#00D9FF] group-hover:transform group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Button>
          </div>
        ))}

        {/* Quick Practice Mode */}
        <div className="pt-2 border-t border-[#3F3F46]/30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
              onSuggestionClick(randomSuggestion);
            }}
            className="w-full bg-gradient-to-r from-[#7C3AED]/20 to-[#EC4899]/20 border-[#7C3AED]/30 hover:border-[#EC4899]/30 text-[#FFFFFF] hover:text-[#EC4899] transition-all"
          >
            <ArrowRight className="w-3 h-3 mr-2" />
            Random Practice Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}