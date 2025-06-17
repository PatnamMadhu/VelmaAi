import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Mic, Zap, Settings, MessageSquare, FileText } from 'lucide-react';
import { FloatingAssistant } from '@/components/FloatingAssistantFixed';
import { FloatingMicButton } from '@/components/FloatingMicButton';

export default function SimpleChat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                VelariAI
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Real-time AI Interview Assistant</p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsAssistantOpen(true)}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 shadow-lg text-xs sm:text-sm px-3 sm:px-4"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Start Assistant</span>
            <span className="sm:hidden">Start</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Bot className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Your AI-Powered
                <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Interview Coach
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                Practice technical interviews with real-time AI responses, voice input, 
                and personalized feedback based on your background.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 px-4">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Voice Input</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Speak naturally with advanced speech recognition technology
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Real-time Responses</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Get instant AI-powered answers with sub-second response times
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Context-Aware</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Personalized responses based on your resume and background
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4 px-4">
            <Button
              size="lg"
              onClick={() => setIsAssistantOpen(true)}
              className="text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 shadow-xl"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Launch VelariAI Assistant
            </Button>
            
            <p className="text-xs sm:text-sm text-gray-500">
              Or use <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">Ctrl + Shift + V</kbd> to toggle
            </p>
          </div>
        </div>
      </div>

      {/* Floating Components */}
      <FloatingMicButton 
        onClick={() => setIsAssistantOpen(true)}
        isActive={isAssistantOpen}
      />
      
      <FloatingAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
}