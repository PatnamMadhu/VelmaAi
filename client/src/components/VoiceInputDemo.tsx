import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedVoiceInput } from '@/components/EnhancedVoiceInput';
import { Bot, Mic } from 'lucide-react';

export function VoiceInputDemo() {
  const [sessionId] = useState(() => `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Array<{ text: string; isVoice: boolean; timestamp: number }>>([]);

  const handleMessageSent = (message: string, isVoice: boolean) => {
    setMessages(prev => [...prev, { 
      text: message, 
      isVoice, 
      timestamp: Date.now() 
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <span>Enhanced Voice Input System Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Continuous listening with auto-restart</li>
                <li>• Live partial and final transcription</li>
                <li>• Smart follow-up question handling</li>
                <li>• Technical term correction</li>
                <li>• Editable transcripts before sending</li>
                <li>• Context-aware conversation tracking</li>
              </ul>
            </div>

            <EnhancedVoiceInput
              sessionId={sessionId}
              onMessageSent={handleMessageSent}
              placeholder="Try saying: 'Tell me about your experience with React and Node.js'"
            />

            {messages.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Message History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.isVoice 
                            ? 'bg-green-50 border-l-4 border-green-500' 
                            : 'bg-gray-50 border-l-4 border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {msg.isVoice && <Mic className="w-4 h-4 text-green-600" />}
                          <span className="text-xs font-medium text-gray-600">
                            {msg.isVoice ? 'Voice Input' : 'Text Input'} • {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}