'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmissionReview } from "./SubmissionReview";
import { getReviewByUserAndSubmission } from "@/actions/reviews";
import { useAuth } from "@clerk/nextjs";

interface SubmissionDetailsModalProps {
  submission: {
    id: string;
    projectName: string;
    description: string;
    repoUrl: string | null;
    demoUrl: string | null;
    presentationUrl: string | null;
    submittedAt: Date;
    updatedAt: Date | null;
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
    track?: {
      id: string;
      name: string;
    } | null;
    trackId: string | null;
  };
  hackathonId: string;
  isOrganizer?: boolean;
  isJudge?: boolean;
}

export function SubmissionDetailsModal({
  submission,
  hackathonId,
  isOrganizer = false,
  isJudge = false,
}: SubmissionDetailsModalProps) {
  const { userId } = useAuth();
  const [userReview, setUserReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const canReview = isJudge || isOrganizer;
  
  // Determine user role for the review component
  let userRole: 'judge' | 'team_member' | 'organizer' = 'team_member';
  if (isOrganizer) userRole = 'organizer';
  else if (isJudge) userRole = 'judge';
  
  useEffect(() => {
    const fetchReview = async () => {
      if (!canReview || !userId) return;
      
      try {
        const review = await getReviewByUserAndSubmission({
          userId,
          submissionId: submission.id
        });
        setUserReview(review);
      } catch (error) {
        console.error('Error fetching review:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReview();
  }, [submission.id, userId, canReview]);

  const formattedDate = new Date(submission.submittedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{submission.projectName}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-600">
              Team: {submission.team?.name || 'Unknown Team'}
            </p>
            {submission.track && (
              <>
                <span className="text-gray-400">•</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {submission.track.name}
                </span>
              </>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-2">Project Description</h3>
            <p className="text-sm whitespace-pre-line mb-4">{submission.description}</p>
            
            <Separator className="my-4" />
            
            <h3 className="font-semibold mb-2">Project Links</h3>
            <div className="space-y-3">
              {submission.repoUrl && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">GitHub Repository</h4>
                  <a 
                    href={submission.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    {submission.repoUrl}
                  </a>
                </div>
              )}
              
              {submission.demoUrl && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Live Demo</h4>
                  <a 
                    href={submission.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {submission.demoUrl}
                  </a>
                </div>
              )}
              
              {submission.presentationUrl && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Presentation</h4>
                  <a 
                    href={submission.presentationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {submission.presentationUrl}
                  </a>
                </div>
              )}
            </div>
            
            {/* Add Review Form for judges/organizers */}
            {canReview && userId && (
              <div className="mt-6">
                {!loading && (
                  <SubmissionReview 
                    submissionId={submission.id}
                    hackathonId={hackathonId}
                    userId={userId}
                    existingReview={userReview}
                    userRole={userRole}
                  />
                )}
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Submission Info</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Submitted on</h4>
                  <p className="text-sm">{formattedDate}</p>
                </div>
                
                {submission.updatedAt && new Date(submission.updatedAt).getTime() !== new Date(submission.submittedAt).getTime() && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Last updated</h4>
                    <p className="text-sm">{new Date(submission.updatedAt).toLocaleString()}</p>
                  </div>
                )}
                
                {submission.team?.members && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Team Members</h4>
                    <ul className="mt-1 space-y-1">
                      {submission.team.members.map((member) => (
                        <li key={member.id} className="flex items-center gap-2 text-sm">
                          {member.user.image_url && (
                            <img 
                              src={member.user.image_url} 
                              alt={`${member.user.first_name} ${member.user.last_name}`}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span>
                            {member.user.first_name} {member.user.last_name}
                            {member.role === 'leader' && (
                              <span className="text-xs text-gray-500 ml-1">(Leader)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button size="sm" asChild>
                <Link href={`/hackathons/${hackathonId}/submissions/${submission.id}`}>
                  View Full Page
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 