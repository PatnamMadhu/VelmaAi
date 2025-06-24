import { useState } from 'react';
import { Bot } from 'lucide-react';
import { FloatingAssistant } from '@/components/FloatingAssistant';
import { FloatingMicButton } from '@/components/FloatingMicButton';

export default function Home() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleToggleAssistant = () => {
    setIsAssistantOpen(!isAssistantOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Landing Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-6">
              AnmaAI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Your real-time AI assistant for interview preparation
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Practice with voice input, get instant AI responses, and prepare for your next interview with personalized context and unlimited conversation memory.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Voice Input</h3>
              <p className="text-gray-600 text-sm">Practice speaking naturally with real-time voice recognition</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Responses</h3>
              <p className="text-gray-600 text-sm">Get immediate AI feedback with streaming responses</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Context</h3>
              <p className="text-gray-600 text-sm">Add your resume and get personalized interview practice</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Ready to start practicing? Click the floating assistant to begin.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>✓ No signup required</span>
              <span>✓ Free to use</span>
              <span>✓ Privacy focused</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mic Button */}
      <FloatingMicButton 
        onClick={handleToggleAssistant}
        isActive={isAssistantOpen}
      />

      {/* Floating Assistant */}
      {isAssistantOpen && (
        <FloatingAssistant
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}
