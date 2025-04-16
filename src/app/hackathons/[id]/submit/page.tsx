import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getUserTeamForHackathon } from '@/actions/teams';
import { getTracksByHackathonId } from '@/actions/hackathon';
import { redirect, notFound } from 'next/navigation';
import SubmissionForm from '@/components/hackathons/SubmissionForm';

export default async function SubmitProjectPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathon info
  const hackathon = await getHackathonByIdCached(params.id);
  
  if (!hackathon) {
    notFound();
  }
  
  // Check if hackathon is accepting submissions
  if (hackathon.status !== 'active') {
    redirect(`/hackathons/${params.id}?error=Hackathon is not active for submissions`);
  }
  
  // Get user's team
  const team = await getUserTeamForHackathon(userId, params.id);
  
  if (!team) {
    redirect(`/hackathons/${params.id}/teams/new?error=You must join or create a team before submitting`);
  }
  
  // Get tracks for this hackathon
  const tracks = await getTracksByHackathonId(params.id);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Submit Your Project</h1>
      <p className="text-gray-600 mb-6">
        Share your hackathon project for {hackathon.name}
      </p>
      
      <SubmissionForm 
        hackathonId={params.id} 
        teamId={team.id}
        teamName={team.name}
        tracks={tracks}
      />
    </div>
  );
} 