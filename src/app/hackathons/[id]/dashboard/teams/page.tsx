import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getTeamsWithDetailsForHackathonCached } from '@/actions/teams';
import { TeamCard } from '../_components/TeamCard';

export default async function TeamsPage({ 
  params
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: hackathonId } = await params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  
  // Get all teams with members and submissions
  const teams = await getTeamsWithDetailsForHackathonCached(hackathonId);

  return (
    <div className="py-8 px-6">
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {teams.map(team => (
            <TeamCard 
              key={team.id} 
              team={team} 
              hackathonId={hackathonId} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600">No teams yet</h3>
          <p className="text-gray-500">No teams have registered for this hackathon yet</p>
        </div>
      )}
    </div>
  );
} 