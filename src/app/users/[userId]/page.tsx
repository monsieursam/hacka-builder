import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserRound, Award, Calendar, MapPin, Users } from 'lucide-react';
import { 
  getUserByIdCached, 
  getHackathonsOrganizedByUser, 
  getHackathonsParticipatedByUser 
} from '@/actions/users';
import { HackathonStatus } from '@/db/schema';

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get status badge color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'published':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  
  // Get user data
  const user = await getUserByIdCached(userId);
  
  if (!user) {
    notFound();
  }
  
  // Get hackathons organized by the user
  const organizedHackathons = await getHackathonsOrganizedByUser(userId);
  
  // Get hackathons the user is participating in
  const participatingHackathons = await getHackathonsParticipatedByUser(userId);
  
  // Get user display name
  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email.split('@')[0];
  
  return (
    <main className="container py-10">
      {/* User Profile Header */}
      <div className="mb-10 flex flex-col md:flex-row gap-8 items-start">
        <Avatar className="h-32 w-32">
          <AvatarImage src={user.image_url || undefined} alt={displayName} />
          <AvatarFallback className="text-4xl">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
          <p className="text-gray-600 mb-4">{user.email}</p>
          <div className="flex gap-4">
            <div>
              <span className="text-gray-500">Organized</span>
              <p className="font-bold text-2xl">{organizedHackathons.length}</p>
            </div>
            <div>
              <span className="text-gray-500">Participated</span>
              <p className="font-bold text-2xl">{participatingHackathons.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Organized Hackathons */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Organized Hackathons</h2>
        
        {organizedHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizedHackathons.map(hackathon => (
              <Card key={hackathon.id} className="p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(new Date(hackathon.startDate))} - {formatDate(new Date(hackathon.endDate))}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(hackathon.status)}`}>
                    {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    hackathon.registrationStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Registration {hackathon.registrationStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 text-sm">
                    {hackathon.isVirtual ? 'Virtual' : hackathon.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 text-sm">
                    {hackathon.minTeamSize}-{hackathon.maxTeamSize} members per team
                  </span>
                </div>
                <Separator className="my-4" />
                <Button variant="default" className="w-full" asChild>
                  <Link href={`/hackathons/${hackathon.id}`}>
                    View Hackathon
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No hackathons organized yet</h3>
            <p className="text-gray-500">This user hasn't organized any hackathons</p>
          </div>
        )}
      </div>
      
      {/* Participating Hackathons */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Participating Hackathons</h2>
        
        {participatingHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participatingHackathons.map(hackathon => (
              <Card key={hackathon.id} className="p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {formatDate(new Date(hackathon.startDate))} - {formatDate(new Date(hackathon.endDate))}
                </p>
                <p className="text-sm text-purple-600 mb-4">
                  <Award className="h-4 w-4 inline mr-1" />
                  Team: {hackathon.teamName}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(hackathon.status)}`}>
                    {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                  </span>
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}`}>
                      View Hackathon
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" size="sm" asChild>
                    <Link href={`/hackathons/${hackathon.id}/teams/${hackathon.teamId}`}>
                      View Team
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No hackathons participated in yet</h3>
            <p className="text-gray-500">This user hasn't participated in any hackathons</p>
          </div>
        )}
      </div>
    </main>
  );
} 