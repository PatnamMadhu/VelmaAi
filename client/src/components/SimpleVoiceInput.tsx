import { useState } from 'react';
import { Mic, MicOff, Send, Square, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEnhancedVoiceInput } from '@/hooks/useEnhancedVoiceInput';

interface SimpleVoiceInputProps {
  sessionId: string;
  onMessageSent?: (message: string, isVoice: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SimpleVoiceInput({ 
  sessionId, 
  onMessageSent, 
  disabled = false, 
  placeholder = "Ask me anything..."
}: SimpleVoiceInputProps) {
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useEnhancedVoiceInput();

  const handleSendVoice = () => {
    if (finalTranscript.trim()) {
      onMessageSent?.(finalTranscript.trim(), true);
      resetTranscript();
    }
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      onMessageSent?.(textInput.trim(), false);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            type="button"
            onClick={() => setInputMode('voice')}
            variant={inputMode === 'voice' ? 'default' : 'ghost'}
            size="sm"
            className="flex items-center gap-2"
            disabled={!isSupported}
          >
            <Mic className="w-4 h-4" />
            Voice
          </Button>
          <Button
            type="button"
            onClick={() => setInputMode('text')}
            variant={inputMode === 'text' ? 'default' : 'ghost'}
            size="sm"
            className="flex items-center gap-2"
          >
            <Type className="w-4 h-4" />
            Type
          </Button>
        </div>
      </div>

      {/* Voice Input Mode */}
      {inputMode === 'voice' && isSupported && (
        <div className="space-y-3">
          {/* Live Transcript */}
          {(transcript || interimTranscript || isListening) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">What you're saying:</span>
                {isListening && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-600">Recording</span>
                  </div>
                )}
              </div>
              <div className="text-base text-gray-800 min-h-[40px] leading-relaxed">
                {finalTranscript && <span className="font-medium">{finalTranscript}</span>}
                {interimTranscript && <span className="text-gray-500 italic"> {interimTranscript}</span>}
                {isListening && !interimTranscript && !finalTranscript && (
                  <span className="text-gray-400 italic">Start speaking...</span>
                )}
              </div>
            </div>
          )}

          {/* Voice Control Buttons */}
          <div className="flex gap-3">
            {!isListening ? (
              <Button
                type="button"
                onClick={startListening}
                disabled={disabled}
                size="lg"
                className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
              >
                <Mic className="w-6 h-6 mr-3" />
                Start Recording
              </Button>
            ) : (
              <Button
                type="button"
                onClick={stopListening}
                disabled={disabled}
                size="lg"
                className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold animate-pulse"
              >
                <Square className="w-6 h-6 mr-3" />
                Stop Recording
              </Button>
            )}

            {finalTranscript && (
              <>
                <Button
                  type="button"
                  onClick={handleSendVoice}
                  disabled={disabled || !finalTranscript.trim()}
                  size="lg"
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </Button>
                <Button
                  type="button"
                  onClick={resetTranscript}
                  variant="outline"
                  size="lg"
                  className="h-14 px-6 border-2 text-base font-medium"
                >
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 h-14 text-base px-4"
            />
            <Button
              type="button"
              onClick={handleSendText}
              disabled={disabled || !textInput.trim()}
              size="lg"
              className="h-14 px-8 text-lg font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              Send
            </Button>
          </div>
        </div>
      )}

      {/* Voice not supported fallback */}
      {inputMode === 'voice' && !isSupported && (
        <div className="text-center p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <div className="text-amber-700 mb-3">
            <MicOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-base font-medium">Voice input not supported</p>
            <p className="text-sm">Please use the Type mode instead</p>
          </div>
          <Button
            onClick={() => setInputMode('text')}
            className="mt-2"
          >
            Switch to Type Mode
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="text-red-700 text-sm font-medium">
            <strong>Voice Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        {inputMode === 'voice' 
          ? "Click 'Start Recording' and speak your question clearly"
          : "Type your question and press Enter or click Send"
        }
      </div>
    </div>
  );
}