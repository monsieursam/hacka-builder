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

export default async function HackathonTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: hackathonId } = await params;
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    notFound();
  }
  
  const teams = await getTeamsByHackathonIdCached(hackathonId);
  
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
                <div className="flex gap-2">
                  <Button variant="default" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}/teams/${team.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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