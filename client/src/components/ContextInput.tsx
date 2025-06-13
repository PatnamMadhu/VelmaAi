import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, FileText, CheckCircle, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ContextInputProps {
  sessionId: string;
  onContextSaved?: () => void;
}

export function ContextInput({ sessionId, onContextSaved }: ContextInputProps) {
  const [context, setContext] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSaveContext = async () => {
    if (!context.trim()) {
      toast({
        title: "Context Required",
        description: "Please enter some context information before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest('POST', '/api/context', {
        content: context,
        sessionId,
      });

      setIsSaved(true);
      onContextSaved?.();
      
      toast({
        title: "Context Saved",
        description: "Your context information has been saved successfully.",
      });

      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline w-4 h-4 mr-2" />
          Context Information
        </label>
        <Textarea 
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Paste your resume, notes, or any context information here to help the AI provide better responses..."
          className="min-h-64 resize-none"
        />
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {context.length} characters
          </span>
          <Button 
            onClick={handleSaveContext}
            disabled={isSaving || !context.trim()}
            className={`${isSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Context
              </>
            )}
          </Button>
        </div>
      </div>

      {isSaved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Context Loaded</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">AI will use this information in responses</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
