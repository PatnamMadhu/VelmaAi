import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Mic, MicOff, Send, X, Zap, Settings } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ContextInput } from '@/components/ContextInput';

export default function SimpleChat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContextInput, setShowContextInput] = useState(false);
  const { toast } = useToast();
  
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VelariAI</h1>
              <p className="text-sm text-gray-500">Real-time AI Assistant</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContextInput(!showContextInput)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Context</span>
          </Button>
        </div>
      </div>

      {/* Context Input Section */}
      {showContextInput && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <ContextInput 
              sessionId={sessionId} 
              onContextSaved={() => setShowContextInput(false)} 
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        {/* Current Question */}
        {currentQuestion && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-primary">Q</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Question</h2>
                  <p className="text-gray-700 leading-relaxed">{currentQuestion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Answer */}
        {(currentAnswer || isStreaming) && (
          <Card className="mb-6 flex-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">VelariAI Response</h2>
                    {!isStreaming && currentAnswer && (
                      <div className="flex items-center space-x-2">
                        <Zap className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Real-time AI</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {currentAnswer}
                    </div>
                    
                    {/* Streaming indicator */}
                    {isStreaming && (
                      <div className="flex items-center space-x-2 mt-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is responding...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Message */}
        {!currentQuestion && !currentAnswer && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 max-w-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to VelariAI</h2>
              <p className="text-gray-600">Ask me anything! I'll provide intelligent, real-time responses to help with your questions.</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Voice Input */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-3">
              <Button
                size="lg"
                onClick={handleVoiceToggle}
                disabled={!isSupported || isProcessing}
                className={`w-14 h-14 rounded-full relative transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-primary hover:bg-blue-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                  </>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Voice Status */}
            <div className="text-center mb-4">
              {!isSupported && (
                <div className="text-sm text-red-600">
                  <MicOff className="inline w-4 h-4 mr-1" />
                  Speech recognition not supported
                </div>
              )}
              
              {isSupported && !isListening && !transcript && (
                <div className="text-sm text-gray-600">
                  Click microphone to speak
                </div>
              )}
              
              {isListening && (
                <div className="text-sm text-orange-600">
                  <div className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  Listening... speak your question
                </div>
              )}
            </div>

            {/* Transcription Preview */}
            {transcript && (
              <Card className="mb-4 border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Transcribed:</span>
                      <p className="text-sm text-gray-800 mt-1">{transcript}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={handleTranscriptSend}
                      disabled={isProcessing}
                      className="ml-3"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Text Input */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here or use voice input..."
                disabled={isProcessing}
                className="pr-10"
              />
              {textInput && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setTextInput('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            <Button 
              onClick={() => handleSendMessage(textInput)}
              disabled={!textInput.trim() || isProcessing}
              className="transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="flex items-center justify-center text-xs text-gray-500">
            <span><kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Enter</kbd> to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}