import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Target, Award, BarChart3 } from 'lucide-react';

interface SessionStats {
  questionsAnswered: number;
  averageResponseTime: number;
  questionTypes: Record<string, number>;
  complexity: Record<string, number>;
  totalTime: number;
}

interface InterviewInsightsProps {
  sessionId: string;
  isVisible?: boolean;
}

export function InterviewInsights({ sessionId, isVisible = true }: InterviewInsightsProps) {
  const [stats, setStats] = useState<SessionStats>({
    questionsAnswered: 0,
    averageResponseTime: 0,
    questionTypes: {},
    complexity: {},
    totalTime: 0
  });
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    // Simulate real-time stats tracking
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalTime: Math.floor((Date.now() - sessionStartTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  if (!isVisible) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTopQuestionType = () => {
    const types = Object.entries(stats.questionTypes);
    if (types.length === 0) return null;
    return types.reduce((a, b) => a[1] > b[1] ? a : b);
  };

  const getPerformanceLevel = () => {
    if (stats.questionsAnswered < 3) return { level: 'Getting Started', color: 'text-blue-400' };
    if (stats.questionsAnswered < 8) return { level: 'Building Momentum', color: 'text-green-400' };
    if (stats.questionsAnswered < 15) return { level: 'Interview Ready', color: 'text-yellow-400' };
    return { level: 'Expert Level', color: 'text-purple-400' };
  };

  const topType = getTopQuestionType();
  const performance = getPerformanceLevel();

  return (
    <Card className="bg-[#1A1A1A]/90 backdrop-blur-lg border-[#00D9FF]/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#FFFFFF] flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#00D9FF]" />
          <span>Interview Session Insights</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Level */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#7C3AED]/20 to-[#EC4899]/20 rounded-lg border border-[#7C3AED]/30">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#EC4899]" />
            <span className="text-sm text-[#FFFFFF] font-medium">Performance</span>
          </div>
          <span className={`text-sm font-bold ${performance.color}`}>
            {performance.level}
          </span>
        </div>

        {/* Session Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#27272A] p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-3 h-3 text-[#00D9FF]" />
              <span className="text-xs text-[#A1A1AA]">Questions</span>
            </div>
            <p className="text-lg font-bold text-[#FFFFFF]">{stats.questionsAnswered}</p>
          </div>
          
          <div className="bg-[#27272A] p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-3 h-3 text-[#00D9FF]" />
              <span className="text-xs text-[#A1A1AA]">Session Time</span>
            </div>
            <p className="text-lg font-bold text-[#FFFFFF]">{formatTime(stats.totalTime)}</p>
          </div>
        </div>

        {/* Question Type Distribution */}
        {Object.keys(stats.questionTypes).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[#A1A1AA] font-medium">Question Types Practiced</p>
            {Object.entries(stats.questionTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <Badge className="text-xs bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]">
                  {type.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-xs text-[#FFFFFF]">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Average Response Time */}
        {stats.averageResponseTime > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Avg Response Time</span>
              <span className="text-xs text-[#FFFFFF]">{stats.averageResponseTime}s</span>
            </div>
            <Progress 
              value={Math.min((30 - stats.averageResponseTime) / 30 * 100, 100)} 
              className="h-2 bg-[#27272A]"
            />
            <p className="text-xs text-[#A1A1AA]">
              {stats.averageResponseTime < 15 ? 'Excellent response speed!' : 
               stats.averageResponseTime < 25 ? 'Good response timing' : 
               'Consider practicing for faster responses'}
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-3 bg-[#0F0F0F] rounded-lg border border-[#3F3F46]/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-3 h-3 text-[#00D9FF]" />
            <span className="text-xs text-[#FFFFFF] font-medium">Recommendations</span>
          </div>
          <div className="space-y-1">
            {stats.questionsAnswered < 5 && (
              <p className="text-xs text-[#A1A1AA]">• Practice more technical questions to build confidence</p>
            )}
            {!stats.questionTypes.behavioral && stats.questionsAnswered > 2 && (
              <p className="text-xs text-[#A1A1AA]">• Try some behavioral questions using STAR format</p>
            )}
            {topType && topType[1] > 3 && (
              <p className="text-xs text-[#A1A1AA]">• Consider diversifying with {topType[0] === 'technical' ? 'system design' : 'technical'} questions</p>
            )}
            {stats.averageResponseTime > 20 && (
              <p className="text-xs text-[#A1A1AA]">• Practice concise responses for better interview timing</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}