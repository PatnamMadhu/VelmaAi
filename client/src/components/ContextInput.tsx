import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ContextInputProps {
  sessionId: string;
  onContextSaved?: () => void;
}

export function ContextInput({ sessionId, onContextSaved }: ContextInputProps) {
  const [context, setContext] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasContext, setHasContext] = useState(false);
  const { toast } = useToast();

  const handleSaveContext = async () => {
    if (!context.trim()) {
      toast({
        title: "Empty Context",
        description: "Please enter some context before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest('POST', '/api/context', {
        sessionId,
        content: context.trim(),
      });

      setHasContext(true);
      setIsExpanded(false);
      
      toast({
        title: "Context Saved",
        description: "Your background information has been saved successfully.",
      });

      onContextSaved?.();
    } catch (error) {
      console.error('Failed to save context:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save context. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearContext = () => {
    setContext('');
    setHasContext(false);
    setIsExpanded(false);
  };

  if (!isExpanded && !hasContext) {
    return (
      <Card className="border-dashed border-2 border-gray-300 hover:border-primary/50 transition-colors cursor-pointer" 
            onClick={() => setIsExpanded(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-3 text-gray-500 hover:text-primary transition-colors">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Background Context</span>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Upload your resume, job description, or interview notes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isExpanded && hasContext) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-sm font-medium text-green-800">Context Active</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {context.length} characters
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded(true)}
                className="text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearContext}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Background Context</span>
          <Badge variant="outline" className="text-xs">Optional</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add your resume, job description, or any relevant background information to get personalized responses.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Paste your resume, job description, or interview preparation notes here...

Example:
- Current role: Senior Software Engineer at TechCorp
- Experience: 5 years in full-stack development
- Skills: React, Node.js, Python, AWS
- Interviewing for: Lead Developer position
- Focus areas: System design, team leadership"
          rows={12}
          className="resize-none"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {context.length} characters
          </span>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSaveContext}
              disabled={isSaving || !context.trim()}
              className="min-w-[100px]"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Context
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}