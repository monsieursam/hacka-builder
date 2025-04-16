import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getTeamById } from '@/actions/teams';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

// Define types for team members
interface TeamMember {
  id: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  imageUrl: string | null;
}

interface TeamWithMembers {
  id: string;
  name: string;
  description: string | null;
  hackathonId: string;
  projectName: string | null;
  lookingForMembers: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: number;
  teamMembers: TeamMember[];
}

async function getTeamDetails(teamId: string): Promise<TeamWithMembers | null> {
  // This would be replaced with a real function to get team details with members
  // For now we'll return a placeholder
  const team = await getTeamById(teamId);
  if (!team) return null;

  return {
    ...team,
    members: team.members || 1, // Fallback
    teamMembers: [
      { 
        id: '1',
        userId: team.id, 
        role: 'owner',
        name: 'Team Owner',
        email: 'owner@example.com',
        imageUrl: null
      }
    ]
  };
}

export default async function TeamDetailsPage({ params }: { params: { id: string, teamId: string } }) {
  const { id: hackathonId, teamId } = params;
  const { userId } = await auth();
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    notFound();
  }
  
  const team = await getTeamDetails(teamId);
  
  if (!team) {
    notFound();
  }
  
  // Check if the current user is a member of this team
  const isTeamMember = userId && team.teamMembers.some(member => member.userId === userId);
  
  return (
    <main className="pb-12">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/hackathons">Hackathons</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathon.id}`}>{hackathon.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathon.id}/teams`}>Teams</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{team.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {team.members} members
                </span>
                {team.lookingForMembers && (
                  <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">Recruiting</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {isTeamMember ? (
                <Button variant="secondary" asChild>
                  <Link href={`/hackathons/${hackathon.id}/teams/${team.id}/edit`}>Edit Team</Link>
                </Button>
              ) : team.lookingForMembers ? (
                <Button variant="secondary">Join Team</Button>
              ) : null}
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" asChild>
                <Link href={`/hackathons/${hackathon.id}/teams`}>Back to Teams</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">About the Team</h2>
              <p className="text-gray-700 mb-6">
                {team.description || "This team hasn't provided a description yet."}
              </p>
              
              {team.projectName && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project</h3>
                    <p className="text-purple-600 font-semibold">{team.projectName}</p>
                  </div>
                </>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Team Members</h2>
              <div className="space-y-4">
                {team.teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Team Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created On</p>
                  <p>{new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recruitment Status</p>
                  <p>{team.lookingForMembers ? 'Looking for members' : 'Team complete'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <div className="flex justify-between items-center">
                    <p>{team.members} / {hackathon.maxTeamSize}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(team.members / hackathon.maxTeamSize) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Hackathon Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Hackathon</p>
                  <p>{hackathon.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dates</p>
                  <p>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</p>
                </div>
                <Separator className="my-2" />
                <Button className="w-full" asChild>
                  <Link href={`/hackathons/${hackathon.id}`}>
                    View Hackathon
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 