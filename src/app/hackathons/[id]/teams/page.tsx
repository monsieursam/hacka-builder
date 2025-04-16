import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getHackathonByIdCached, getTeamsByHackathonIdCached } from '@/actions/hackathon';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { auth } from '@clerk/nextjs/server';
import TeamsTable from './_components/TeamsTable';

export default async function HackathonTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: hackathonId } = await params;
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    notFound();
  }
  
  const teams = await getTeamsByHackathonIdCached(hackathonId);
  
  // Check if current user is the organizer
  const { userId } = await auth();
  const isOrganizer = userId === hackathon.organizerId;
  
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
              <BreadcrumbPage>Teams</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{hackathon.name} Teams</h1>
              <p className="text-white/80">
                Browse participating teams or create your own
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Team Listing */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {teams.length > 0 ? (
          <TeamsTable teams={teams} hackathonId={hackathonId} isOrganizer={isOrganizer} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No teams yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create a team for this hackathon</p>
            <Button asChild>
              <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
} 