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
      <div 
        className="border-dashed border border-gray-300 hover:border-primary/50 transition-colors cursor-pointer rounded-md p-3 bg-gray-50/50" 
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-center space-x-2 text-gray-500 hover:text-primary transition-colors">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">Add Background Context</span>
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">
          Resume, job description, or notes
        </p>
      </div>
    );
  }

  if (!isExpanded && hasContext) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-md p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <div>
              <span className="text-xs sm:text-sm font-medium text-green-800">Context Active</span>
              <Badge variant="secondary" className="ml-1 text-xs px-1">
                {context.length} chars
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="text-xs h-6 px-2"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearContext}
              className="text-xs h-6 px-1 text-red-600 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">Background Context</span>
          <Badge variant="outline" className="text-xs px-1">Optional</Badge>
        </div>
      </div>
      
      <Textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Add your resume, job description, or interview notes..."
        rows={4}
        className="resize-none text-xs border border-gray-300 rounded-md p-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {context.length} chars
        </span>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(false)}
            disabled={isSaving}
            size="sm"
            className="text-xs h-6 px-2"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSaveContext}
            disabled={isSaving || !context.trim()}
            size="sm"
            className="text-xs h-6 px-2"
          >
            {isSaving ? (
              <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-2 h-2 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}