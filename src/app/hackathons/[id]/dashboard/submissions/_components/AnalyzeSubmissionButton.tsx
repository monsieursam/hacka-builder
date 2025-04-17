'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCompletion } from '@ai-sdk/react';

interface AnalyzeSubmissionButtonProps {
  submissionId: string;
  projectName: string;
  description: string;
  repositoryUrl?: string | null;
}

export function AnalyzeSubmissionButton({ 
  submissionId, 
  projectName, 
  description, 
  repositoryUrl 
}: AnalyzeSubmissionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    completion, 
    isLoading, 
    complete,
    error: completionError
  } = useCompletion({
    api: '/api/submissions/analyze',
    body: {
      submissionId,
      projectName,
      description,
      repositoryUrl
    }
  });
  
  const handleAnalyze = async () => {
    // Create a customized prompt with all relevant information
    await complete(`Please analyze this hackathon submission:
${repositoryUrl ? `Repository URL: ${repositoryUrl}` : ''}

Provide detailed feedback on:
1. Introduction about the project
2. Technical implementation and code quality (which languages were used, how well they were used, how clean the code is, etc.)
3. Creativity and innovation
4. Potential impact and usefulness
5. Overall strengths and areas for improvement
6. Suggested score (1-100) with justification`);
  };

  const hasError = completionError !== null && completionError !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          AI Analyze
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Analysis: {projectName}</DialogTitle>
          <DialogDescription>
            Intelligent feedback and evaluation of this submission
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {!completion && !isLoading && !hasError && (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg">
              <Lightbulb className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">AI-Powered Submission Analysis</h3>
              <p className="text-sm text-center text-muted-foreground mb-6">
                Get intelligent feedback and evaluations to help you judge this submission more effectively.
              </p>
              <Button 
                onClick={handleAnalyze}
                variant="default"
              >
                Generate Analysis
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-center text-muted-foreground">
                Analyzing submission, please wait...
              </p>
            </div>
          )}
          
          {hasError && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
              <h3 className="font-semibold mb-2">Error</h3>
              <p className="text-sm">{completionError?.toString() || 'An error occurred'}</p>
              <Button 
                onClick={handleAnalyze}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {completion && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">
                {completion}
              </div>
              
              {/* Debug information (remove in production) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 p-3 border rounded-md">
                  <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                  <pre className="text-xs mt-2 overflow-auto max-h-40">
                    {JSON.stringify({ completion, isLoading, hasError: completionError }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 