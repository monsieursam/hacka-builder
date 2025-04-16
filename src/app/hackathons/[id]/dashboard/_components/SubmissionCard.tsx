'use client';

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubmissionDetailsModal } from "./SubmissionDetailsModal";

interface SubmissionCardProps {
  submission: {
    id: string;
    projectName: string;
    description: string;
    repoUrl: string | null;
    demoUrl: string | null;
    presentationUrl: string | null;
    submittedAt: Date;
    updatedAt: Date | null;
    trackId: string | null;
    track?: {
      id: string;
      name: string;
    } | null;
    team?: {
      id: string;
      name: string;
      members?: {
        id: string;
        role: string;
        user: {
          id: string;
          first_name: string;
          last_name: string;
          image_url: string | null;
        };
      }[];
    };
  };
  hackathonId: string;
  isOrganizer?: boolean;
  isJudge?: boolean;
}

export function SubmissionCard({ 
  submission, 
  hackathonId, 
  isOrganizer = false, 
  isJudge = false 
}: SubmissionCardProps) {
  return (
    <Card className="p-6 w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{submission.projectName}</h3>
          <p className="text-sm text-gray-500">
            Submitted by Team: {submission.team?.name || 'Unknown Team'}
          </p>
        </div>
        {submission.trackId && (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {submission.track?.name || 'Track'}
          </span>
        )}
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">{submission.description}</p>
      
      <div className="space-y-2 mb-4">
        {submission.repoUrl && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              GitHub Repository
            </a>
          </div>
        )}
        
        {submission.demoUrl && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z"/>
            </svg>
            <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Live Demo
            </a>
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-end">
        <SubmissionDetailsModal 
          submission={submission} 
          hackathonId={hackathonId}
          isOrganizer={isOrganizer}
          isJudge={isJudge}
        />
      </div>
    </Card>
  );
} 