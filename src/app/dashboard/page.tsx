import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { hackathons, teams, teamMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function DashboardPage() {
  // Get current user
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathons organized by the user
  const organizedHackathons = await db.query.hackathons.findMany({
    where: eq(hackathons.organizerId, userId),
    orderBy: (hackathons, { desc }) => [desc(hackathons.createdAt)],
  });
  
  // Get hackathons the user is participating in (via team membership)
  const participatingQuery = await db
    .select({
      hackathon: hackathons,
      teamName: teams.name,
      teamId: teams.id
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .innerJoin(hackathons, eq(teams.hackathonId, hackathons.id))
    .where(eq(teamMembers.userId, userId));
  
  const participatingHackathons = participatingQuery.map(record => ({
    ...record.hackathon,
    teamName: record.teamName,
    teamId: record.teamId
  }));
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      
      {/* Hackathons you're organizing */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Hackathons You're Organizing</h2>
          <Button asChild>
            <Link href="/hackathons/new">Create New Hackathon</Link>
          </Button>
        </div>
        
        {organizedHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizedHackathons.map(hackathon => (
              <Card key={hackathon.id} className="p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {formatDate(new Date(hackathon.startDate))} - {formatDate(new Date(hackathon.endDate))}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    hackathon.status === 'active' ? 'bg-green-100 text-green-800' : 
                    hackathon.status === 'published' ? 'bg-blue-100 text-blue-800' :
                    hackathon.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    hackathon.registrationStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Registration {hackathon.registrationStatus}
                  </span>
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}/dashboard`}>
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-2">You're not organizing any hackathons yet</h3>
            <p className="text-gray-500 mb-6">Create your first hackathon to get started</p>
            <Button asChild>
              <Link href="/hackathons/new">Create Hackathon</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Hackathons you're participating in */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Hackathons You're Participating In</h2>
          <Button variant="outline" asChild>
            <Link href="/hackathons">Browse Hackathons</Link>
          </Button>
        </div>
        
        {participatingHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participatingHackathons.map(hackathon => (
              <Card key={hackathon.id} className="p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {formatDate(new Date(hackathon.startDate))} - {formatDate(new Date(hackathon.endDate))}
                </p>
                <p className="text-sm text-purple-600 mb-4">
                  Team: {hackathon.teamName}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    hackathon.status === 'active' ? 'bg-green-100 text-green-800' : 
                    hackathon.status === 'published' ? 'bg-blue-100 text-blue-800' :
                    hackathon.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                  </span>
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}/dashboard`}>
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-2">You're not participating in any hackathons yet</h3>
            <p className="text-gray-500 mb-6">Join a hackathon to get started</p>
            <Button asChild>
              <Link href="/hackathons">Browse Hackathons</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 