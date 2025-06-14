import { useState } from 'react';
import { Bot, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMicButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function FloatingMicButton({ onClick, isActive = false }: FloatingMicButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-lg border transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] border-[#00D9FF]/50 text-white animate-pulse' 
            : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] border-[#00D9FF]/30 text-white hover:scale-110 hover:border-[#00D9FF]/70'
        }`}
        style={{
          boxShadow: isActive 
            ? '0 0 20px rgba(0, 217, 255, 0.6), 0 0 40px rgba(124, 58, 237, 0.4)' 
            : '0 0 12px rgba(0, 217, 255, 0.4), 0 4px 20px rgba(124, 58, 237, 0.3)'
        }}
      >
        {isActive ? (
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        ) : (
          <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        )}
      </Button>
      
      {/* Tooltip - only show on larger screens */}
      {isHovered && !isActive && (
        <div className="absolute bottom-16 sm:bottom-18 right-0 glassmorphism text-[#F9FAFB] text-xs px-3 py-2 rounded-lg whitespace-nowrap hidden sm:block animate-fade-in">
          Start VelariAI Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1E293B]"></div>
        </div>
      )}
      
      {isActive && (
        <div className="absolute bottom-16 sm:bottom-18 right-0 bg-[#6366F1]/90 backdrop-blur-lg text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap hidden sm:block animate-fade-in">
          Assistant Active
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#6366F1]"></div>
        </div>
      )}
    </div>
  );
}