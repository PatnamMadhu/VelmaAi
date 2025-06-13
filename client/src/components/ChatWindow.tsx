import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Mic, Zap, MessageCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useQuery } from '@tanstack/react-query';
import { Message } from '@shared/schema';

interface ChatWindowProps {
  sessionId: string;
  onNewMessage?: () => void;
}

interface DisplayMessage extends Message {
  isStreaming?: boolean;
  streamContent?: string;
}

export function ChatWindow({ sessionId, onNewMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { lastMessage, isStreaming } = useWebSocket(sessionId);

  // Fetch existing messages
  const { data: messageHistory } = useQuery({
    queryKey: [`/api/messages/${sessionId}`],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (messageHistory && typeof messageHistory === 'object' && messageHistory !== null && 'messages' in messageHistory) {
      const data = messageHistory as { messages: Message[] };
      if (Array.isArray(data.messages)) {
        setMessages(data.messages.map((msg: Message) => ({ ...msg })));
      }
    }
  }, [messageHistory]);

  // Handle WebSocket streaming messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'stream_start':
        if (lastMessage.messageId) {
          setStreamingMessageId(lastMessage.messageId);
          // Add a new streaming message placeholder
          const streamingMsg: DisplayMessage = {
            id: parseInt(lastMessage.messageId),
            sessionId,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            isVoice: false,
            isStreaming: true,
            streamContent: '',
          };
          setMessages(prev => [...prev, streamingMsg]);
        }
        break;

      case 'stream_chunk':
        if (lastMessage.content && streamingMessageId) {
          setMessages(prev => prev.map(msg => 
            msg.id === parseInt(streamingMessageId) && msg.isStreaming
              ? { ...msg, streamContent: (msg.streamContent || '') + lastMessage.content }
              : msg
          ));
        }
        break;

      case 'stream_end':
        if (lastMessage.fullResponse && streamingMessageId) {
          setMessages(prev => prev.map(msg => 
            msg.id === parseInt(streamingMessageId) && msg.isStreaming
              ? { 
                  ...msg, 
                  content: lastMessage.fullResponse || '',
                  isStreaming: false,
                  streamContent: undefined,
                }
              : msg
          ));
          setStreamingMessageId(null);
          onNewMessage?.();
        }
        break;
    }
  }, [lastMessage, streamingMessageId, sessionId, onNewMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center py-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">VelariAI</h2>
          <p className="text-gray-600">Start by speaking or typing your question. I'll use your context to provide intelligent, real-time responses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <div className="max-w-xs lg:max-w-md">
                <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className="flex items-center justify-end mt-1 space-x-2">
                  {message.isVoice && (
                    <Mic className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500">
                    {message.timestamp ? formatTime(message.timestamp) : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div className="max-w-xs lg:max-w-2xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">
                            {message.isStreaming 
                              ? message.streamContent || '' 
                              : message.content
                            }
                          </div>
                          
                          {/* Streaming indicator */}
                          {message.isStreaming && (
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">AI is typing...</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">
                        {message.timestamp ? formatTime(message.timestamp) : ''}
                      </span>
                      {!message.isStreaming && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-2 h-2 mr-1" />
                          &lt;0.8s
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
