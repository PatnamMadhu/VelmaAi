import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Brain } from 'lucide-react';
import { ContextInput } from '@/components/ContextInput';
import { MicInput } from '@/components/MicInput';
import { ChatWindow } from '@/components/ChatWindow';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function Home() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isConnected, setIsConnected] = useState(true); // Assume connected initially

  // Fetch memory status
  const { data: memoryStatus, refetch: refetchMemory } = useQuery({
    queryKey: [`/api/memory/${sessionId}`],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleContextSaved = () => {
    refetchMemory();
  };

  const handleMessageSent = () => {
    // Refetch memory status and invalidate messages
    refetchMemory();
    queryClient.invalidateQueries({ queryKey: [`/api/messages/${sessionId}`] });
  };

  const memoryUsage = (memoryStatus && typeof memoryStatus === 'object' && 'memoryUsage' in memoryStatus) ? (memoryStatus as any).memoryUsage : 0;
  const messageCount = (memoryStatus && typeof memoryStatus === 'object' && 'messageCount' in memoryStatus) ? (memoryStatus as any).messageCount : 0;
  const maxMessages = (memoryStatus && typeof memoryStatus === 'object' && 'maxMessages' in memoryStatus) ? (memoryStatus as any).maxMessages : 10;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">VelariAI</h1>
              <p className="text-sm text-gray-500">Real-time AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Context Input */}
        <div className="p-6 flex-1">
          <ContextInput 
            sessionId={sessionId} 
            onContextSaved={handleContextSaved}
          />

          {/* Context Status */}
          {(memoryStatus && typeof memoryStatus === 'object' && 'hasContext' in memoryStatus && (memoryStatus as any).hasContext) && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Context Loaded</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">AI will use this information in responses</p>
              </CardContent>
            </Card>
          )}

          {/* Memory Status */}
          <Card className="mt-4 bg-gray-50">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                <Brain className="inline w-4 h-4 mr-2" />
                Memory Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Conversation History</span>
                  <span className="font-medium">{messageCount}/{maxMessages} exchanges</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${memoryUsage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected to AI service' : 'Connection lost'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Window */}
        <ChatWindow 
          sessionId={sessionId} 
          onNewMessage={handleMessageSent}
        />

        {/* Input Controls */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <MicInput 
              sessionId={sessionId}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
