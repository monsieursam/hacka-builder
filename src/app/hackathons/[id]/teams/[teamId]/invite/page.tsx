import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHackathonById } from '@/actions/hackathon';
import { getTeamById } from '@/actions/teams';
import InviteTeamMemberForm from './_components/InviteTeamMemberForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { db } from '@/db';
import { eq, and } from 'drizzle-orm';
import { teamMembers } from '@/db/schema';

export default async function InviteTeamMemberPage({ params }: { params: { id: string, teamId: string } }) {
  const { id: hackathonId, teamId } = params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathon and team details
  const hackathon = await getHackathonById(hackathonId);
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  const team = await getTeamById(teamId);
  if (!team) {
    redirect(`/hackathons/${hackathonId}/teams`);
  }
  
  // Check if the current user is a team member with the role of owner
  const currentMembers = await db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, teamId)
  });
  
  const isTeamOwner = currentMembers.some(member => 
    member.userId === userId && member.role === 'owner'
  );
  
  if (!isTeamOwner && hackathon.organizerId !== userId) {
    // Only team owners or hackathon organizers can invite members
    redirect(`/hackathons/${hackathonId}/teams/${teamId}`);
  }
  
  // Check if the team is already at max capacity
  if (team.members >= hackathon.maxTeamSize) {
    redirect(`/hackathons/${hackathonId}/teams/${teamId}?error=team_full`);
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-8">
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
                <Link href={`/hackathons/${hackathonId}`}>{hackathon.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathonId}/teams`}>Teams</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathonId}/teams/${teamId}`}>{team.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Invite Members</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Invite Team Members</h1>
        <p className="mb-8 text-gray-600">
          Invite people to join your team for {hackathon.name}. 
          Your team can have up to {hackathon.maxTeamSize} members 
          (currently {team.members}/{hackathon.maxTeamSize}).
        </p>
        
        <InviteTeamMemberForm 
          hackathonId={hackathonId} 
          teamId={teamId} 
          availableSpots={hackathon.maxTeamSize - team.members}
        />
      </div>
    </div>
  );
} 