import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Bot, X, Minus, FileText, Mic, MicOff, Send } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/hooks/use-toast';
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
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');

  const { toast } = useToast();
  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Update editable transcript when speech recognition provides new transcript
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async (message: string, isVoice: boolean = false) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentQuestion(message);
    setCurrentAnswer('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          sessionId,
          isVoice
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentAnswer(data.response || 'No response received');
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentAnswer('Sorry, there was an error processing your request. Please try again.');
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsStreaming(false);
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
      minWidth={window.innerWidth < 768 ? 280 : 300}
      minHeight={isMinimized ? 60 : window.innerWidth < 768 ? 400 : 450}
      maxWidth={window.innerWidth < 768 ? window.innerWidth - 10 : 800}
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
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome message */}
              {!currentQuestion && !currentAnswer && !isStreaming && (
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
              )}
            </div>

            {/* INPUT SECTION - ALWAYS VISIBLE AT BOTTOM */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(139, 69, 19, 0.8)',
              borderTop: '2px solid rgba(168, 85, 247, 0.6)',
              padding: '16px',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="text"
                  value={editableTranscript || ""}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message or use voice..."
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '2px solid rgba(168, 85, 247, 0.5)',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
                <button 
                  onClick={handleVoiceToggle}
                  disabled={!isSupported}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isListening ? '#DC2626' : '#9333EA',
                    border: '2px solid rgba(168, 85, 247, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff style={{ width: '20px', height: '20px', color: 'white' }} />
                  ) : (
                    <Mic style={{ width: '20px', height: '20px', color: 'white' }} />
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
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(to right, #9333EA, #EC4899)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(168, 85, 247, 0.6)',
                    cursor: editableTranscript.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                    opacity: editableTranscript.trim() && !isProcessing ? 1 : 0.5,
                    transition: 'all 0.3s'
                  }}
                  title="Send message"
                >
                  {isProcessing ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  ) : (
                    <Send style={{ width: '20px', height: '20px', color: 'white' }} />
                  )}
                </button>
              </div>
              {isListening && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#EF4444',
                    borderRadius: '50%',
                    animation: 'pulse 1s infinite'
                  }}></div>
                  <span style={{ fontSize: '14px', color: '#FCA5A5', fontWeight: '500' }}>
                    Listening for voice input...
                  </span>
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