import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Edit, 
  Volume2, 
  VolumeX,
  Loader2,
  MessageSquare 
} from 'lucide-react';
import { useEnhancedVoiceInput } from '@/hooks/useEnhancedVoiceInput';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EnhancedVoiceInputProps {
  sessionId: string;
  onMessageSent?: (message: string, isVoice: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function EnhancedVoiceInput({ 
  sessionId, 
  onMessageSent, 
  disabled = false,
  placeholder = "Type your message or use voice input..."
}: EnhancedVoiceInputProps) {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscriptEditor, setShowTranscriptEditor] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  const { toast } = useToast();
  
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    finalTranscript,
    error,
    lastQuestion,
    conversationContext,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    clearContext,
    updateLastQuestion,
  } = useEnhancedVoiceInput();

  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Update editable transcript when transcript changes
  useEffect(() => {
    if (transcript && !showTranscriptEditor) {
      setEditableTranscript(transcript);
    }
  }, [transcript, showTranscriptEditor]);

  const handleSendMessage = async (message: string, isVoice: boolean = false) => {
    if (!message.trim() || disabled) return;

    setIsProcessing(true);
    try {
      // Build context-aware message for follow-up questions
      let contextualMessage = message.trim();
      
      if (isVoice && lastQuestion && isFollowUpQuestion(message, lastQuestion)) {
        contextualMessage = `Following up on "${lastQuestion}": ${message}`;
      }

      await apiRequest('POST', '/api/chat', {
        message: contextualMessage,
        sessionId,
        isVoice,
      });

      // Update conversation context
      updateLastQuestion(contextualMessage);
      onMessageSent?.(contextualMessage, isVoice);
      
      if (isVoice) {
        resetTranscript();
        setEditableTranscript('');
        setShowTranscriptEditor(false);
      } else {
        setTextInput('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(textInput);
    }
  };

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }
    
    toggleListening();
  };

  const handleTranscriptSend = () => {
    if (showTranscriptEditor && editableTranscript.trim()) {
      handleSendMessage(editableTranscript, true);
    } else if (transcript.trim()) {
      handleSendMessage(transcript, true);
    }
  };

  const handleTranscriptEdit = () => {
    setEditableTranscript(transcript);
    setShowTranscriptEditor(true);
  };

  const handleEditCancel = () => {
    setEditableTranscript(transcript);
    setShowTranscriptEditor(false);
  };

  const handleEditSave = () => {
    setShowTranscriptEditor(false);
    if (editableTranscript.trim()) {
      handleSendMessage(editableTranscript, true);
    }
  };

  const isFollowUpQuestion = (current: string, last: string): boolean => {
    const followUpIndicators = [
      'can you elaborate',
      'tell me more',
      'go deeper',
      'expand on',
      'give me an example',
      'what about',
      'how about',
      'and what',
      'also',
      'additionally',
      'furthermore',
    ];
    
    const currentLower = current.toLowerCase();
    return followUpIndicators.some(indicator => currentLower.includes(indicator));
  };

  if (!isSupported) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4 text-center">
          <VolumeX className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">
            Voice recognition is not supported in this browser.
            Please use Chrome, Edge, or Safari for voice input.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Status Indicator */}
      {isListening && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm font-medium text-green-700">Listening...</span>
              <Badge variant="secondary" className="text-xs">
                {interimTranscript ? 'Processing' : 'Ready'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Transcript Display */}
      {transcript && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between space-x-2 mb-3">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Voice Transcript</span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTranscriptEdit}
                  className="h-6 px-2 text-blue-600 hover:bg-blue-100"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetTranscript}
                  className="h-6 px-2 text-blue-600 hover:bg-blue-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {showTranscriptEditor ? (
              <div className="space-y-2">
                <Input
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  placeholder="Edit your transcript..."
                  className="text-sm"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={!editableTranscript.trim() || isProcessing}
                    className="h-7"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    Send
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditCancel}
                    className="h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                  <span className="font-medium">{finalTranscript}</span>
                  {interimTranscript && (
                    <span className="text-gray-400 italic"> {interimTranscript}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleTranscriptSend}
                  disabled={!transcript.trim() || isProcessing}
                  className="h-7"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Send className="w-3 h-3 mr-1" />
                  )}
                  Send Voice Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversation Context */}
      {conversationContext.length > 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Recent Context</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearContext}
                className="h-5 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              {conversationContext.slice(-2).map((context, idx) => (
                <div key={idx} className="truncate">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {context.substring(0, 80)}...
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Controls */}
      <div className="flex space-x-2 items-end">
        <div className="flex-1">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isProcessing}
            className="min-h-[40px]"
          />
        </div>
        
        <Button
          onClick={handleVoiceToggle}
          disabled={disabled}
          size="icon"
          variant={isListening ? "destructive" : "default"}
          className={`h-10 w-10 flex-shrink-0 ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        
        <Button
          onClick={() => handleSendMessage(textInput)}
          disabled={!textInput.trim() || disabled || isProcessing}
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          title="Send message"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Voice Control Instructions */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>
          {isListening 
            ? "🎤 Listening for your voice input - Click stop when done"
            : "Click the microphone to start voice input"
          }
        </p>
        {isListening && (
          <p className="text-green-600">
            Voice recognition will automatically restart if interrupted
          </p>
        )}
      </div>
    </div>
  );
}