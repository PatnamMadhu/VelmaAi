import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { Bot, X, Minus, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedVoiceInput } from '@/components/EnhancedVoiceInput';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { ContextInput } from '@/components/ContextInput';


interface FloatingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function FloatingAssistant({ isOpen, onClose, sessionId }: FloatingAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showContextInput, setShowContextInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  
  const [windowState, setWindowState] = useState<WindowState>(() => {
    const saved = localStorage.getItem('velari-window-state');
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Default positioning to be more centered and accessible
    const defaultState = {
      width: isMobile ? Math.min(340, window.innerWidth - 20) : isTablet ? 370 : 400,
      height: isMobile ? Math.min(450, window.innerHeight - 100) : 520,
      x: isMobile ? 10 : Math.max(20, window.innerWidth - (isTablet ? 390 : 420)),
      y: isMobile ? 80 : Math.max(20, (window.innerHeight - 520) / 2)
    };

    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        // Validate the saved state to ensure it's within viewport
        if (parsedState.x >= 0 && parsedState.y >= 0 && 
            parsedState.x + parsedState.width <= window.innerWidth &&
            parsedState.y + parsedState.height <= window.innerHeight) {
          return parsedState;
        }
      } catch (e) {
        console.warn('Invalid saved window state, using default');
      }
    }
    
    return defaultState;
  });



  const { lastMessage } = useWebSocket(sessionId);

  // Save window state to localStorage
  useEffect(() => {
    localStorage.setItem('velari-window-state', JSON.stringify(windowState));
  }, [windowState]);

  // Reset window position if it's off-screen
  useEffect(() => {
    if (isOpen) {
      const { x, y, width, height } = windowState;
      const isOffScreen = x < 0 || y < 0 || 
                         x + width > window.innerWidth || 
                         y + height > window.innerHeight;
      
      if (isOffScreen) {
        const centerX = Math.max(20, (window.innerWidth - width) / 2);
        const centerY = Math.max(20, (window.innerHeight - height) / 2);
        
        setWindowState(prev => ({
          ...prev,
          x: centerX,
          y: centerY
        }));
      }
    }
  }, [isOpen, windowState]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  }, [isOpen, onClose]);



  // Handle WebSocket streaming messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'stream_start':
        setIsStreaming(true);
        setCurrentAnswer('');
        break;

      case 'stream_chunk':
        if (lastMessage.content) {
          setCurrentAnswer(prev => prev + lastMessage.content);
        }
        break;

      case 'stream_end':
        if (lastMessage.fullResponse) {
          setCurrentAnswer(lastMessage.fullResponse);
        }
        setIsStreaming(false);
        setIsProcessing(false);
        break;

      case 'error':
        setIsStreaming(false);
        setIsProcessing(false);
        setCurrentAnswer('Sorry, I encountered an error processing your request.');
        break;
    }
  }, [lastMessage]);

  const handleNewMessage = (message: string, isVoice: boolean) => {
    setCurrentQuestion(message);
    setCurrentAnswer('');
    setIsProcessing(true);
    setIsStreaming(true);
  };

  if (!isOpen) return null;

  const content = (
    <Rnd
      size={{ width: windowState.width, height: isMinimized ? 60 : windowState.height }}
      position={{ x: windowState.x, y: windowState.y }}
      onDragStop={(e, d) => {
        setWindowState(prev => ({ ...prev, x: d.x, y: d.y }));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMinimized) {
          setWindowState({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            x: position.x,
            y: position.y,
          });
        }
      }}
      minWidth={window.innerWidth < 768 ? 280 : 300}
      minHeight={isMinimized ? 60 : window.innerWidth < 768 ? 350 : 400}
      maxWidth={window.innerWidth < 768 ? window.innerWidth - 10 : 800}
      maxHeight={isMinimized ? 60 : window.innerHeight - 50}
      dragHandleClassName="drag-handle"
      disableDragging={false}
      enableResizing={!isMinimized}
      className="floating-assistant"
      style={{
        zIndex: 1000,
      }}
    >
      <Card className="w-full h-full rounded-2xl shadow-2xl backdrop-blur-lg bg-white/95 border-gray-200 overflow-hidden floating-assistant">
        {/* Header */}
        <div className="drag-handle bg-gradient-to-r from-primary to-blue-600 text-white p-2 sm:p-3 cursor-move">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">VelariAI</span>
              {isStreaming && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs hidden sm:inline">Responding...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowContextInput(!showContextInput)}
                className={`text-white hover:bg-white/20 w-6 h-6 sm:w-8 sm:h-8 p-0 ${showContextInput ? 'bg-white/20' : ''}`}
                title={showContextInput ? "Hide Context" : "Add Background Context"}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 w-6 h-6 sm:w-8 sm:h-8 p-0"
                title="Minimize"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20 w-6 h-6 sm:w-8 sm:h-8 p-0"
                title="Close"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          
          {/* Context Toggle Bar */}
          {!isMinimized && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <span className="text-xs opacity-75">Context:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowContextInput(!showContextInput)}
                  className="text-white hover:bg-white/20 text-xs h-5 px-2"
                >
                  {showContextInput ? 'Hide' : 'Add Resume/Notes'}
                </Button>
              </div>
              <div className="text-xs opacity-75">
                Drag to move • Resize corners
              </div>
            </div>
          )}
        </div>

        {!isMinimized && (
          <CardContent className="p-0 h-full flex flex-col">
            {/* Context Input */}
            {showContextInput && (
              <div className="p-3 border-b border-gray-200 bg-gray-50/50" style={{ overflowY: 'hidden' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Background Context</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowContextInput(false)}
                    className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <ContextInput 
                  sessionId={sessionId} 
                  onContextSaved={() => {
                    toast({
                      title: "Context Updated",
                      description: "Background information saved successfully.",
                    });
                  }} 
                />
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col p-2 sm:p-4 space-y-2 sm:space-y-4 min-h-0" style={{ maxHeight: 'calc(100% - 120px)', overflowY: 'auto' }}>
              {/* Current Question */}
              {currentQuestion && (
                <div className="bg-primary/10 rounded-lg p-2 sm:p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-semibold text-primary">Q</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{currentQuestion}</p>
                  </div>
                </div>
              )}

              {/* Current Answer */}
              {(currentAnswer || isStreaming) && (
                <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0 chat-container">
                      <div className="text-xs sm:text-sm text-gray-800 leading-relaxed chat-response-text">
                        {currentAnswer}
                      </div>
                      
                      {/* Streaming indicator */}
                      {isStreaming && (
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="text-xs text-gray-500">Typing...</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome Message */}
              {!currentQuestion && !currentAnswer && (
                <div className="text-center py-4 sm:py-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">VelariAI Assistant</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Ask me anything or use voice input!</p>
                </div>
              )}
            </div>

            {/* Enhanced Voice Input Section */}
            <div className="p-2 sm:p-4 border-t border-gray-200 bg-gray-50">
              <EnhancedVoiceInput
                sessionId={sessionId}
                onMessageSent={handleNewMessage}
                disabled={isProcessing}
                placeholder="Ask me anything about your interview preparation..."
              />
            </div>
          </CardContent>
        )}
      </Card>
    </Rnd>
  );

  return createPortal(content, document.body);
}