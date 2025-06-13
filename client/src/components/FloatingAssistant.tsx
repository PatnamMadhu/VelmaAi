import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { Bot, Mic, MicOff, Send, X, Minus, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  
  const [windowState, setWindowState] = useState<WindowState>(() => {
    const saved = localStorage.getItem('velari-window-state');
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    return saved ? JSON.parse(saved) : {
      width: isMobile ? Math.min(340, window.innerWidth - 20) : isTablet ? 370 : 380,
      height: isMobile ? Math.min(420, window.innerHeight - 120) : 480,
      x: isMobile ? 10 : window.innerWidth - (isTablet ? 390 : 400),
      y: isMobile ? 60 : 100
    };
  });

  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { lastMessage } = useWebSocket(sessionId);

  // Save window state to localStorage
  useEffect(() => {
    localStorage.setItem('velari-window-state', JSON.stringify(windowState));
  }, [windowState]);

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

  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

  const handleSendMessage = async (message: string, isVoice: boolean = false) => {
    if (!message.trim() || isProcessing) return;

    setCurrentQuestion(message.trim());
    setCurrentAnswer('');
    setIsProcessing(true);
    setIsStreaming(true);

    try {
      await apiRequest('POST', '/api/chat', {
        message: message.trim(),
        sessionId,
        isVoice,
      });

      if (isVoice) {
        resetTranscript();
      } else {
        setTextInput('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
      setIsProcessing(false);
      setCurrentAnswer('Failed to send message. Please try again.');
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(textInput);
    }
  };

  const handleTranscriptSend = () => {
    if (transcript.trim()) {
      handleSendMessage(transcript, true);
    }
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
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs hidden sm:inline">Responding...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowContextInput(!showContextInput)}
                className="text-white hover:bg-white/20 w-6 h-6 sm:w-8 sm:h-8 p-0"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 w-6 h-6 sm:w-8 sm:h-8 p-0"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20 w-6 h-6 sm:w-8 sm:h-8 p-0"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <CardContent className="p-0 h-full flex flex-col">
            {/* Context Input */}
            {showContextInput && (
              <div className="p-2 border-b border-gray-200 bg-gray-50/30" style={{ overflowY: 'hidden' }}>
                <ContextInput 
                  sessionId={sessionId} 
                  onContextSaved={() => setShowContextInput(false)} 
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

            {/* Voice Transcription Preview */}
            {transcript && (
              <div className="px-2 sm:px-4 pb-2">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-xs text-orange-600 font-medium">Transcribed:</span>
                      <p className="text-xs sm:text-sm text-orange-800 mt-1">{transcript}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={handleTranscriptSend}
                      disabled={isProcessing}
                      className="ml-2 h-6 w-6 sm:h-8 sm:w-8 p-0"
                    >
                      <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Section */}
            <div className="p-2 sm:p-4 border-t border-gray-200 bg-gray-50 space-y-2 sm:space-y-3">
              {/* Voice Button */}
              <div className="flex justify-center">
                <Button
                  size={window.innerWidth < 768 ? "default" : "lg"}
                  onClick={handleVoiceToggle}
                  disabled={!isSupported || isProcessing}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-primary hover:bg-blue-700'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>

              {/* Voice Status */}
              <div className="text-center">
                {!isSupported && (
                  <div className="text-xs text-red-600">
                    <MicOff className="inline w-3 h-3 mr-1" />
                    Speech not supported
                  </div>
                )}
                
                {isSupported && !isListening && !transcript && (
                  <div className="text-xs text-gray-600">
                    Tap microphone to speak
                  </div>
                )}
                
                {isListening && (
                  <div className="text-xs text-orange-600">
                    <div className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-2"></div>
                    Listening...
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Input 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  disabled={isProcessing}
                  className="text-xs sm:text-sm"
                />
                
                <Button 
                  onClick={() => handleSendMessage(textInput)}
                  disabled={!textInput.trim() || isProcessing}
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Rnd>
  );

  return createPortal(content, document.body);
}