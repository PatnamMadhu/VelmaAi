import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Mic, Zap, Settings, MessageSquare, FileText } from 'lucide-react';
import { FloatingAssistant } from '@/components/FloatingAssistant';
import { FloatingMicButton } from '@/components/FloatingMicButton';

export default function SimpleChat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                VelariAI
              </h1>
              <p className="text-sm text-gray-600">Real-time AI Interview Assistant</p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsAssistantOpen(true)}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start Assistant
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Bot className="w-12 h-12 text-white" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-600 animate-ping opacity-20"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                Your AI-Powered
                <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Interview Coach
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Practice technical interviews with real-time AI responses, voice input, 
                and personalized feedback based on your background.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Voice Input</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Speak naturally with advanced speech recognition technology
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Real-time Responses</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Get instant AI-powered answers with sub-second response times
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Context-Aware</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Personalized responses based on your resume and background
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-12 space-y-4">
            <Button
              size="lg"
              onClick={() => setIsAssistantOpen(true)}
              className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              Launch VelariAI Assistant
            </Button>
            
            <p className="text-sm text-gray-500">
              Or use <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Ctrl + Shift + V</kbd> to toggle
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