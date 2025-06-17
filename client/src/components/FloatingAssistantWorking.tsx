import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Bot, X, Minus, FileText, Mic, MicOff, Send } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ContextInput } from './ContextInput';

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

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isVoice?: boolean;
  isStreaming?: boolean;
  streamContent?: string;
}

export function FloatingAssistant({ isOpen, onClose, sessionId }: FloatingAssistantProps) {
  const [windowState, setWindowState] = useState<WindowState>({
    width: window.innerWidth < 768 ? 320 : 400,
    height: window.innerWidth < 768 ? 450 : 500,
    x: window.innerWidth < 768 ? 10 : window.innerWidth - 420,
    y: window.innerWidth < 768 ? 10 : 100,
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [showContextInput, setShowContextInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { toast } = useToast();
  const { isConnected, sendMessage, lastMessage, isStreaming } = useWebSocket(sessionId);
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Update transcript safely
  useEffect(() => {
    if (transcript && transcript !== editableTranscript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'stream_start') {
        const newMessage: Message = {
          id: lastMessage.messageId || Date.now().toString(),
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          isStreaming: true,
          streamContent: ''
        };
        setMessages(prev => [...prev, newMessage]);
      } else if (lastMessage.type === 'stream_chunk') {
        setMessages(prev => prev.map(msg => 
          msg.isStreaming ? {
            ...msg,
            streamContent: (msg.streamContent || '') + lastMessage.content
          } : msg
        ));
      } else if (lastMessage.type === 'stream_end') {
        setMessages(prev => prev.map(msg => 
          msg.isStreaming ? {
            ...msg,
            content: lastMessage.fullResponse || msg.streamContent || '',
            isStreaming: false,
            streamContent: undefined
          } : msg
        ));
        setIsProcessing(false);
      }
    }
  }, [lastMessage]);

  const handleSendMessage = (message: string, isVoice: boolean = false) => {
    if (!message.trim() || isProcessing || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date(),
      isVoice
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    sendMessage({
      type: 'chat',
      message: message.trim(),
      sessionId,
      isVoice
    });
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
      if (editableTranscript.trim()) {
        const messageToSend = editableTranscript.trim();
        setEditableTranscript('');
        resetTranscript();
        handleSendMessage(messageToSend, false);
      }
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
      minWidth={280}
      minHeight={isMinimized ? 60 : 400}
      maxWidth={800}
      maxHeight={isMinimized ? 60 : window.innerHeight - 50}
      dragHandleClassName="drag-handle"
      disableDragging={false}
      enableResizing={!isMinimized}
      className="floating-assistant"
      style={{ zIndex: 1000 }}
    >
      <div className="premium-glass w-full h-full rounded-2xl overflow-hidden ultra-smooth flex flex-col">
        {/* Header */}
        <div className="drag-handle bg-gradient-to-r from-black/80 to-black/60 text-white p-3 cursor-move border-b border-white/5 flex-shrink-0">
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
                className={`text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 p-0 rounded-xl transition-all duration-300 ${
                  showContextInput ? 'bg-white/10 text-white' : ''
                }`}
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

        {/* Content Area */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Context Input */}
            {showContextInput && (
              <div className="p-3 border-b border-white/10 bg-black/30 flex-shrink-0">
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
            <div className="flex-1 p-4 space-y-4 min-h-0 overflow-y-auto bg-gray-800/95 backdrop-blur-sm">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-60">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      VelariAI Assistant
                    </h3>
                    <p className="text-white/70 text-sm max-w-xs">
                      Ask me anything or use voice input to get started!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={message.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-white/20' 
                          : 'bg-gradient-to-br from-purple-600 to-pink-600'
                      }`}>
                        {message.role === 'user' ? (
                          <span className="text-sm font-bold text-white">
                            {message.isVoice ? '🎤' : 'Q'}
                          </span>
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 chat-container">
                        <div className="text-white leading-relaxed chat-response-text">
                          {message.isStreaming ? message.streamContent : message.content}
                        </div>
                        {message.isStreaming && (
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
                ))
              )}
            </div>

            {/* Input Section - Fixed at Bottom */}
            <div className="flex-shrink-0 p-4 border-t-2 border-purple-500/60 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editableTranscript || ""}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message or use voice..."
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 text-white bg-black/70 border-2 border-purple-500/50 rounded-xl placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm font-medium"
                />
                <button 
                  onClick={handleVoiceToggle}
                  disabled={!isSupported}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 font-medium border-2 ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 border-red-400 shadow-lg shadow-red-500/30' 
                      : 'bg-purple-600 hover:bg-purple-700 border-purple-400 shadow-lg shadow-purple-500/30'
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    if (editableTranscript.trim()) {
                      const messageToSend = editableTranscript.trim();
                      setEditableTranscript('');
                      resetTranscript();
                      handleSendMessage(messageToSend, false);
                    }
                  }}
                  disabled={!editableTranscript.trim() || isProcessing}
                  className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 border-2 border-purple-400"
                  title="Send message"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
              {isListening && (
                <div className="flex items-center space-x-2 mt-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-300 font-medium">Listening for voice input...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Rnd>
  );

  return createPortal(content, document.body);
}