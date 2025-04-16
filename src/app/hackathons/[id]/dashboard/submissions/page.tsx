import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached, getSubmissionsByHackathonId } from '@/actions/hackathon';
import { getUserTeamWithMembersForHackathon } from '@/actions/teams';
import { SubmissionCard } from '../_components/SubmissionCard';
import { db } from '@/db';
import { judges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function SubmissionsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const hackathonId = id;
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  // Check if the user is an organizer
  const isOrganizer = userId === hackathon.organizerId;
  
  // Check if user is a judge for this hackathon
  const isJudge = await db.query.judges.findFirst({
    where: and(
      eq(judges.hackathonId, hackathonId),
      eq(judges.userId, userId),
      eq(judges.isAccepted, true)
    )
  });
  
  // Get the user's team for this hackathon if they're a participant
  const userTeam = await getUserTeamWithMembersForHackathon(userId, hackathonId);
  
  // Get submissions
  let submissions: any[] = [];
  if (isOrganizer) {
    // Get all hackathon submissions for organizers
    submissions = await getSubmissionsByHackathonId(hackathonId);
  } else if (userTeam) {
    // Get only the team's submission for participants
    submissions = await getSubmissionsByHackathonId(hackathonId, userTeam.id);
  }

  return (
    <div className="py-8 px-6">
      {(isOrganizer || isJudge) && 
        <div>
          {submissions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">No teams have submitted projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  hackathonId={hackathonId}
                  isOrganizer={isOrganizer}
                  isJudge={!!isJudge}
                />
              ))}
            </div>
          )}
        </div>
      }

      {!isOrganizer && !isJudge && (
        // Participant view of their submission
        <>
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <Card key={submission.id} className="p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{submission.projectName}</h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}/dashboard/submit?edit=true`}>
                      Edit Submission
                    </Link>
                  </Button>
                </div>
                
                <Separator className="mb-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-2">Project Description</h4>
                    <p className="text-gray-700 whitespace-pre-line mb-6">{submission.description}</p>
                    
                    {submission.trackId && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Track</h4>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {submission.track?.name || 'Track'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Project Links</h4>
                    <ul className="space-y-4">
                      {submission.repoUrl && (
                        <li>
                          <h5 className="text-sm text-gray-500">GitHub Repository</h5>
                          <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            {submission.repoUrl}
                          </a>
                        </li>
                      )}
                      
                      {submission.demoUrl && (
                        <li>
                          <h5 className="text-sm text-gray-500">Demo URL</h5>
                          <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {submission.demoUrl}
                          </a>
                        </li>
                      )}
                      
                      {submission.presentationUrl && (
                        <li>
                          <h5 className="text-sm text-gray-500">Presentation</h5>
                          <a href={submission.presentationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {submission.presentationUrl}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="mb-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Submit Your Project</h3>
                <p className="text-gray-600 mb-6">
                  Share your team's work for this hackathon. You'll need to provide:
                </p>
                <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-600">
                  <li>Project name and description</li>
                  <li>GitHub repository link (required)</li>
                  <li>Demo URL (optional)</li>
                  <li>Presentation link (optional)</li>
                </ul>
                <Button asChild>
                  <Link href={`/hackathons/${hackathon.id}/dashboard/submit`}>
                    Create Submission
                  </Link>
                </Button>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
} 