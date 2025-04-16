import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getTracksByHackathonId } from '@/actions/hackathon';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/db';
import { submissions, judges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserTeamForHackathon } from '@/actions/teams';
import { getReviewByUserAndSubmission, getReviewsBySubmission } from '@/actions/reviews';
import { SubmissionReview } from '@/app/hackathons/[id]/dashboard/_components/SubmissionReview';

export default async function SubmissionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; submissionId: string }> 
}) {
  const { userId } = await auth();
  const { submissionId, id } = await params;
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathon info
  const hackathon = await getHackathonByIdCached(id);
  
  if (!hackathon) {
    notFound();
  }
  
  // Get submission details
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: {
      team: {
        with: {
          members: {
            with: {
              user: true
            }
          }
        }
      },
      track: true
    }
  });
  
  if (!submission) {
    notFound();
  }
  
  // Get user's team for this hackathon to check if they are part of the team
  const userTeam = await getUserTeamForHackathon(userId, id);
  const isTeamMember = userTeam?.id === submission.teamId;
  const isOrganizer = userId === hackathon.organizerId;
  
  // Check if user is a judge for this hackathon
  const isJudge = await db.query.judges.findFirst({
    where: and(
      eq(judges.hackathonId, id),
      eq(judges.userId, userId),
      eq(judges.isAccepted, true)
    )
  });
  
  // Determine if the user can leave a review
  const canReview = isJudge || isOrganizer;
  
  // Get the user's review if it exists
  const userReview = canReview ? await getReviewByUserAndSubmission({
    userId,
    submissionId
  }) : null;
  
  // Get all reviews if user is organizer or team member
  const allReviews = (isOrganizer || isTeamMember) ? 
    await getReviewsBySubmission(submissionId) : [];
  
  // Determine user role for the review component
  let userRole: 'judge' | 'team_member' | 'organizer' = 'team_member';
  if (isOrganizer) userRole = 'organizer';
  else if (isJudge) userRole = 'judge';
  
  const formattedDate = new Date(submission.submittedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href={`/hackathons/${id}/submissions`} className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to all submissions
          </Link>
          <h1 className="text-3xl font-bold">{submission.projectName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">
              Submitted by Team: {submission.team?.name || 'Unknown Team'}
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
        </div>
        
        {isTeamMember && (
          <Link href={`/hackathons/${id}/submissions/${submissionId}/edit`}>
            <Button>Edit Submission</Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Project Description</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{submission.description}</p>
            </div>
            
            <Separator className="my-6" />
            
            <h2 className="text-xl font-bold mb-4">Project Links</h2>
            <div className="space-y-4">
              {submission.repoUrl && (
                <div>
                  <h3 className="font-medium mb-1">GitHub Repository</h3>
                  <a 
                    href={submission.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    {submission.repoUrl}
                  </a>
                </div>
              )}
              
              {submission.demoUrl && (
                <div>
                  <h3 className="font-medium mb-1">Live Demo</h3>
                  <a 
                    href={submission.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {submission.demoUrl}
                  </a>
                </div>
              )}
              
              {submission.presentationUrl && (
                <div>
                  <h3 className="font-medium mb-1">Presentation</h3>
                  <a 
                    href={submission.presentationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {submission.presentationUrl}
                  </a>
                </div>
              )}
            </div>
          </Card>
          
          {/* Reviews Section */}
          {(isOrganizer || isTeamMember) && allReviews.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <div className="space-y-4">
                {allReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-sm font-medium">
                            {review.user.first_name} {review.user.last_name}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                          {review.updatedAt && review.updatedAt !== review.createdAt && 
                            ` (updated ${new Date(review.updatedAt).toLocaleDateString()})`}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {review.content}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Review Form for judges/organizers */}
          {canReview && (
            <div className="mt-6">
              <SubmissionReview 
                submissionId={submissionId}
                hackathonId={id}
                userId={userId}
                existingReview={userReview}
                userRole={userRole}
              />
            </div>
          )}
        </div>
        
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Submission Info</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Submitted on</h3>
                <p>{formattedDate}</p>
              </div>
              
              {submission.updatedAt && submission.updatedAt.getTime() !== submission.submittedAt.getTime() && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last updated</h3>
                  <p>{new Date(submission.updatedAt).toLocaleString()}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Team</h3>
                <p>{submission.team?.name || 'Unknown Team'}</p>
              </div>
              
              {submission.team?.members && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
                  <ul className="mt-1 space-y-1">
                    {submission.team.members.map((member) => (
                      <li key={member.id} className="flex items-center gap-2">
                        {member.user.image_url && (
                          <img 
                            src={member.user.image_url} 
                            alt={`${member.user.first_name} ${member.user.last_name}`}
                            className="w-6 h-6 rounded-full"
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
          </Card>
        </div>
      </div>
    </div>
  );
} 