import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Clock, Target, Lightbulb, Zap, MessageSquare } from 'lucide-react';

interface QuestionAnalysis {
  type: string;
  category: string;
  confidence: number;
  format: string;
  complexity: string;
  estimatedTime: number;
  hasContext?: boolean;
  requiresContext?: boolean;
}

interface QuestionAnalyzerProps {
  question: string;
  analysis?: QuestionAnalysis;
  isAnalyzing?: boolean;
}

export function QuestionAnalyzer({ question, analysis, isAnalyzing }: QuestionAnalyzerProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (analysis && question) {
      setShowAnalysis(true);
    }
  }, [analysis, question]);

  if (!question || !showAnalysis) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'behavioral': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'system_design': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'coding': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'star': return <Target className="w-4 h-4" />;
      case 'definition': return <Brain className="w-4 h-4" />;
      case 'comparison': return <MessageSquare className="w-4 h-4" />;
      case 'architecture': return <Lightbulb className="w-4 h-4" />;
      case 'step_by_step': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="bg-[#1A1A1A]/90 backdrop-blur-lg border-[#00D9FF]/20 shadow-lg animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#00D9FF]/20 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#00D9FF] animate-spin" />
            </div>
            <div>
              <p className="text-sm text-[#FFFFFF] font-medium">Analyzing question...</p>
              <p className="text-xs text-[#A1A1AA]">Detecting type and complexity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="bg-[#1A1A1A]/90 backdrop-blur-lg border-[#00D9FF]/20 shadow-lg mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#FFFFFF] flex items-center space-x-2">
            <Brain className="w-4 h-4 text-[#00D9FF]" />
            <span>Question Analysis</span>
          </CardTitle>
          <Badge className={`text-xs ${getTypeColor(analysis.type)}`}>
            {analysis.type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Question Type & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1">Category</p>
            <p className="text-sm text-[#FFFFFF] font-medium">{analysis.category}</p>
          </div>
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1">Complexity</p>
            <p className={`text-sm font-medium capitalize ${getComplexityColor(analysis.complexity)}`}>
              {analysis.complexity}
            </p>
          </div>
        </div>

        {/* Confidence & Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Detection Confidence</span>
            <span className="text-xs text-[#FFFFFF]">{Math.round(analysis.confidence * 100)}%</span>
          </div>
          <Progress 
            value={analysis.confidence * 100} 
            className="h-2 bg-[#27272A]"
          />
        </div>

        {/* Response Format */}
        <div className="flex items-center justify-between p-3 bg-[#27272A] rounded-lg">
          <div className="flex items-center space-x-2">
            {getFormatIcon(analysis.format)}
            <span className="text-sm text-[#FFFFFF] font-medium">
              {analysis.format.replace('_', ' ').toUpperCase()} Format
            </span>
          </div>
          <div className="flex items-center space-x-1 text-[#A1A1AA]">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{analysis.estimatedTime}s</span>
          </div>
        </div>

        {/* Format Description */}
        <div className="text-xs text-[#A1A1AA] bg-[#0F0F0F] p-3 rounded-lg">
          {analysis.format === 'star' && 
            "Response will use STAR format: Situation, Task, Action, Result"}
          {analysis.format === 'definition' && 
            "Response will provide clear definition with examples and practical applications"}
          {analysis.format === 'comparison' && 
            "Response will compare options with trade-offs and recommendations"}
          {analysis.format === 'architecture' && 
            "Response will include system design with components and data flow"}
          {analysis.format === 'step_by_step' && 
            "Response will break down the algorithm with complexity analysis"}
        </div>
      </CardContent>
    </Card>
  );
}