import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AgenticSuggestionsProps {
  sessionId: string;
  onSuggestionClick: (suggestion: string) => void;
  hasMessages: boolean;
}

export function AgenticSuggestions({ sessionId, onSuggestionClick, hasMessages }: AgenticSuggestionsProps) {
  const [isVisible, setIsVisible] = useState(false);

  const { data: suggestionsData, refetch } = useQuery({
    queryKey: [`/api/suggestions/${sessionId}`],
    enabled: hasMessages,
    refetchInterval: 10000, // Refresh every 10 seconds for proactive suggestions
  });

  const suggestions = (suggestionsData as any)?.suggestions || [];

  useEffect(() => {
    if (suggestions.length > 0) {
      setIsVisible(true);
      // Auto-hide after 30 seconds to avoid clutter
      const timer = setTimeout(() => setIsVisible(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [suggestions]);

  useEffect(() => {
    if (hasMessages) {
      // Trigger suggestions generation after new messages
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasMessages, refetch]);

  if (!isVisible || !suggestions.length) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start space-x-2 mb-3">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-sm font-semibold text-orange-900">AI Suggests</h4>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                Proactive
              </Badge>
            </div>
            <p className="text-xs text-orange-700 mb-3">
              Based on our conversation, here are some valuable follow-up topics:
            </p>
            
            <div className="space-y-2">
              {suggestions.map((suggestion: string, index: number) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSuggestionClick(suggestion);
                    setIsVisible(false);
                  }}
                  className="w-full justify-start text-left p-2 h-auto bg-white/60 hover:bg-white border border-orange-200 hover:border-orange-300 group"
                >
                  <div className="flex items-start space-x-2 w-full">
                    <MessageSquare className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-orange-800 flex-1 break-words leading-relaxed">
                      {suggestion}
                    </span>
                    <ArrowRight className="w-3 h-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="w-6 h-6 p-0 text-orange-600 hover:bg-orange-100 flex-shrink-0"
          >
            ×
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}