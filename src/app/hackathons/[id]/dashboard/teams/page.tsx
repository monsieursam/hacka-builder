import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached, getTeamsByHackathonIdCached } from '@/actions/hackathon';

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
  
  // Check if the user is an organizer
  const isOrganizer = userId === hackathon.organizerId;
  
  // Only organizers should be able to access this page
  if (!isOrganizer) {
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }
  
  // Get all teams
  const teams = await getTeamsByHackathonIdCached(hackathonId);

  return (
    <div className="py-8 px-6">
      <h2 className="text-2xl font-bold mb-6">Registered Teams</h2>
      
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Card key={team.id} className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">{team.name}</h3>
              {team.projectName && (
                <p className="text-sm font-medium text-purple-600 mb-2">Project: {team.projectName}</p>
              )}
              <p className="text-gray-600 mb-4">{team.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-gray-600">{team.members} members</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${team.lookingForMembers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {team.lookingForMembers ? 'Recruiting' : 'Team Full'}
                </span>
              </div>
              <Separator className="my-4" />
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/hackathons/${hackathon.id}/teams/${team.id}`}>
                  View Team
                </Link>
              </Button>
            </Card>
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