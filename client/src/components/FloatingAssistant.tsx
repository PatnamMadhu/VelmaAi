import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { Bot, Mic, MicOff, Send, X, Minus, Settings, FileText } from 'lucide-react';

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

  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Local editable transcript state
  const [editableTranscript, setEditableTranscript] = useState('');

  // Sync voice transcript with editable transcript
  useEffect(() => {
    if (transcript && transcript !== editableTranscript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

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
      resetTranscript(); // Clear transcript after sending
    }
  };

  const handleVoiceSend = () => {
    if (transcript.trim()) {
      handleSendMessage(transcript, true);
      resetTranscript(); // Clear transcript after sending
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
      <div className="premium-glass w-full h-full rounded-2xl overflow-hidden ultra-smooth">
        {/* Ultra-modern Header */}
        <div className="drag-handle bg-gradient-to-r from-black/80 to-black/60 text-white p-3 cursor-move border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center premium-glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">VelariAI</span>
              {isStreaming && (
                <div className="flex items-center space-x-2">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span className="text-sm text-white/60 hidden sm:inline">Processing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowContextInput(!showContextInput)}
                className={`text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 p-0 rounded-xl transition-all duration-300 ${showContextInput ? 'bg-white/10 text-white' : ''}`}
                title={showContextInput ? "Hide Context" : "Add Background Context"}
              >
                <FileText className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 p-0 rounded-xl transition-all duration-300"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-red-500/20 w-8 h-8 p-0 rounded-xl transition-all duration-300"
                title="Close"
              >
                <X className="w-4 h-4" />
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
          <div className="p-0 h-full flex flex-col bg-gray-800/95 backdrop-blur-sm">
            {/* Context Input */}
            {showContextInput && (
              <div className="p-3 border-b border-white/10 bg-black/30" style={{ overflowY: 'hidden' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Background Context</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowContextInput(false)}
                    className="text-white/70 hover:text-white h-6 w-6 p-0"
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
                <div className="chat-message-user">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">Q</span>
                    </div>
                    <p className="text-white font-medium leading-relaxed break-words">{currentQuestion}</p>
                  </div>
                </div>
              )}

              {/* Current Answer */}
              {(currentAnswer || isStreaming) && (
                <div className="chat-message-ai">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 chat-container">
                      <div className="text-white leading-relaxed chat-response-text">
                        {currentAnswer}
                      </div>
                      
                      {/* Streaming indicator */}
                      {isStreaming && (
                        <div className="typing-indicator mt-2">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <span className="text-white/60 ml-3">VelariAI is thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome Message */}
              {!currentQuestion && !currentAnswer && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 premium-glow">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 gradient-text">VelariAI Assistant</h3>
                  <p className="text-white/70 text-base">Ask me anything or use voice input to get started!</p>
                </div>
              )}
            </div>

            {/* Voice Transcription Preview - Always visible */}
            <div className="px-4 pb-4">
              <div className="premium-glass p-4 rounded-xl border border-purple-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white font-medium">Voice Input:</span>
                    {isListening && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-red-400">Listening...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Editable voice transcript */}
                <textarea
                  value={editableTranscript || ""}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  placeholder="Click 'Listen' to start speaking or type to edit..."
                  className="context-input w-full min-h-[80px] text-white bg-black/40 border border-purple-500/40 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleVoiceToggle}
                      disabled={!isSupported}
                      className={`premium-button px-4 py-2 text-sm ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-1" />
                          Listen
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setEditableTranscript('');
                        resetTranscript();
                      }}
                      disabled={!editableTranscript.trim()}
                      className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      Clear
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      if (editableTranscript.trim()) {
                        const messageToSend = editableTranscript.trim();
                        setEditableTranscript('');
                        resetTranscript();
                        handleSendMessage(messageToSend, true);
                      }
                    }}
                    disabled={!editableTranscript.trim() || isProcessing}
                    className="premium-button px-4 py-2 text-sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </button>
                </div>
              </div>
            </div>



            {/* Input Section */}
            <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">

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
          </div>
        )}
      </div>
    </Rnd>
  );

  return createPortal(content, document.body);
}