import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Send, X, Edit, Settings, Shield } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MicInputProps {
  sessionId: string;
  onMessageSent?: (message: string, isVoice: boolean) => void;
  disabled?: boolean;
}

export function MicInput({ sessionId, onMessageSent, disabled }: MicInputProps) {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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
  


  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSendMessage = async (message: string, isVoice: boolean = false) => {
    if (!message.trim() || disabled) return;

    // Immediately stop voice capture to prevent AI response being captured
    if (isVoice && isListening) {
      stopListening();
    }

    setIsProcessing(true);
    try {
      await apiRequest('POST', '/api/chat', {
        message: message.trim(),
        sessionId,
        isVoice,
      });

      onMessageSent?.(message.trim(), isVoice);
      
      // Clear input after successful send
      if (isVoice) {
        resetTranscript();
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

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript(); // Clear any previous transcript
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
      console.log('Sending voice input:', transcript.trim());
      handleSendMessage(transcript.trim(), true);
    }
  };

  const handleTranscriptEdit = () => {
    setTextInput(transcript);
    resetTranscript();
  };

  return (
    <div className="space-y-4">
      {/* Voice Input Section */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-3">
          <Button
            size="lg"
            onClick={handleVoiceToggle}
            disabled={!isSupported || disabled || isProcessing}
            className={`w-16 h-16 rounded-full relative transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-primary hover:bg-blue-700'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6" />
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
              </>
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Voice Status Indicators */}
        <div className="text-center">
          {!isSupported && (
            <div className="text-sm text-red-600">
              <MicOff className="inline w-4 h-4 mr-2" />
              Speech recognition not supported in this browser
            </div>
          )}
          
          {isSupported && !isListening && !transcript && (
            <div className="text-sm text-gray-600">
              <MicOff className="inline w-4 h-4 mr-2" />
              Click to start voice input
            </div>
          )}
          
          {isListening && (
            <div className="text-sm text-orange-600">
              <div className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Listening... speak your question
            </div>
          )}
          
          {isProcessing && (
            <div className="text-sm text-primary">
              <Settings className="inline w-4 h-4 animate-spin mr-2" />
              Processing speech...
            </div>
          )}
        </div>

        {/* Transcription Preview */}
        {transcript && (
          <Card className="mt-3 border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Transcribed:</span>
                  <p className="text-sm text-gray-800 mt-1">{transcript}</p>
                </div>
                <div className="ml-2 flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleTranscriptEdit}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleTranscriptSend}
                    disabled={isProcessing}
                    className="h-8"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Manual Text Input */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Input 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question here or use voice input..."
            disabled={disabled || isProcessing}
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
          disabled={!textInput.trim() || disabled || isProcessing}
          className="transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Input Actions */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span><kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Enter</kbd> to send</span>
          <span><kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Shift+Enter</kbd> for new line</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-3 h-3 text-green-600" />
          <span>Your data stays private</span>
        </div>
      </div>
    </div>
  );
}
