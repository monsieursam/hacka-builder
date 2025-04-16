import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getTracksByHackathonId } from '@/actions/hackathon';
import { getUserTeamForHackathon } from '@/actions/teams';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import SubmissionEditForm from '@/components/hackathons/SubmissionEditForm';

export default async function EditSubmissionPage({ 
  params 
}: { 
  params: { id: string; submissionId: string } 
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathon info
  const hackathon = await getHackathonByIdCached(params.id);
  
  if (!hackathon) {
    notFound();
  }
  
  // Check if hackathon is active
  if (hackathon.status !== 'active') {
    redirect(`/hackathons/${params.id}?error=Hackathon is not active for submissions`);
  }
  
  // Get user's team to check authorization
  const team = await getUserTeamForHackathon(userId, params.id);
  
  if (!team) {
    redirect(`/hackathons/${params.id}?error=You are not part of any team in this hackathon`);
  }
  
  // Get submission details
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, params.submissionId),
    with: {
      team: true,
      track: true
    }
  });
  
  if (!submission) {
    notFound();
  }
  
  // Check if the user is part of the team that made this submission
  if (submission.teamId !== team.id) {
    redirect(`/hackathons/${params.id}/submissions/${params.submissionId}?error=You can only edit your own team's submissions`);
  }
  
  // Get tracks for this hackathon
  const tracks = await getTracksByHackathonId(params.id);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Edit Your Submission</h1>
      <p className="text-gray-600 mb-6">
        Update the details of your project submission for {hackathon.name}
      </p>
      
      <SubmissionEditForm
        hackathonId={params.id}
        submissionId={params.submissionId}
        initialData={{
          projectName: submission.projectName,
          description: submission.description,
          repoUrl: submission.repoUrl,
          demoUrl: submission.demoUrl || '',
          presentationUrl: submission.presentationUrl || '',
          trackId: submission.trackId || undefined,
        }}
        teamName={submission.team.name}
        tracks={tracks}
      />
    </div>
  );
} 