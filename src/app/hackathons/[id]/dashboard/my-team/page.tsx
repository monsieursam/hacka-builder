import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserRound } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getUserTeamWithMembersForHackathon } from '@/actions/teams';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function MyTeamPage({ 
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
  
  // Only participants should be able to access this page
  if (isOrganizer) {
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }
  
  // Get the user's team for this hackathon
  const userTeam = await getUserTeamWithMembersForHackathon(userId, hackathonId);
  
  // If no team, redirect to dashboard
  if (!userTeam) {
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Team</h2>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}/edit`}>
              Edit Team
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}/invite`}>
              Invite Members
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Team Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Team Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Team Name</p>
                <p className="font-medium">{userTeam.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p>{userTeam.description || "No description provided."}</p>
              </div>
              
              {userTeam.projectName && (
                <div>
                  <p className="text-sm text-gray-500">Project Name</p>
                  <p className="font-medium">{userTeam.projectName}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Looking for Members</p>
                <p className="font-medium">{userTeam.lookingForMembers ? "Yes" : "No"}</p>
              </div>
            </div>
          </Card>
          
          {/* Team Members Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Team Members</h3>
              <p className="text-sm text-gray-500">{userTeam.members}/{hackathon.maxTeamSize} members</p>
            </div>
            
            {userTeam.teamMembers && userTeam.teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTeam.teamMembers.map(member => (
                  <Card key={member.id} className="p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={member.user?.image_url} 
                        alt={`${member.user?.first_name || ''} ${member.user?.last_name || ''}`} 
                      />
                      <AvatarFallback>
                        <UserRound className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user?.first_name} {member.user?.last_name}
                        {member.role === 'owner' && 
                          <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                            Owner
                          </span>
                        }
                      </p>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No team members found</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Team Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}/invite`}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Invite Team Members
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/hackathons/${hackathon.id}/dashboard/submit`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Submit Project
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 