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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl backdrop-blur-sm transition-all duration-200 ${
          isActive 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isActive ? (
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        )}
      </Button>
      
      {/* Tooltip - only show on larger screens */}
      {isHovered && !isActive && (
        <div className="absolute bottom-14 sm:bottom-16 right-0 bg-black/80 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm hidden sm:block">
          Start AnmaAI Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
        </div>
      )}
      
      {isActive && (
        <div className="absolute bottom-14 sm:bottom-16 right-0 bg-green-600/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm hidden sm:block">
          Assistant Active
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600/90"></div>
        </div>
      )}
    </div>
  );
}