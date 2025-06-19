import { Badge } from '@/components/ui/badge';
import { User, FileText, Sparkles } from 'lucide-react';

interface ContextIndicatorProps {
  hasContext: boolean;
  isPersonalized: boolean;
  className?: string;
}

export function ContextIndicator({ hasContext, isPersonalized, className = '' }: ContextIndicatorProps) {
  if (!hasContext) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge 
        className="text-xs bg-gradient-to-r from-[#7C3AED]/20 to-[#EC4899]/20 text-[#EC4899] border-[#EC4899]/30 flex items-center space-x-1"
      >
        <User className="w-2 h-2" />
        <span>Using Resume Context</span>
      </Badge>
      
      {isPersonalized && (
        <Badge 
          className="text-xs bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/30 flex items-center space-x-1"
        >
          <Sparkles className="w-2 h-2" />
          <span>Personalized</span>
        </Badge>
      )}
    </div>
  );
}