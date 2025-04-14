import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { hackathons, teams, tracks, users, teamMembers, prizes, Team, Hackathon, User, Prize } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { TabsClient } from './_components/TabsClient';

// Client components for interactive tabs

// Get a single hackathon by ID with organizer data

export type HackathonWithOrganizer = Hackathon & {
  organizer: User;
  prizes: Prize[];
};

export async function getHackathonById(id: number): Promise<HackathonWithOrganizer | undefined | null> {
  try {
    const result = await db.query.hackathons.findFirst({
      where: eq(hackathons.id, id),
      with: {
        organizer: true,
        prizes: true
      }
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch hackathon with ID ${id}:`, error);
    return null;
  }
}

export type TeamWithMemberCount = Team & {
  members: number;
};

export async function getTeamsByHackathonId(hackathonId: number): Promise<TeamWithMemberCount[]> {
  try {
    const result = await db.query.teams.findMany({
      where: eq(teams.hackathonId, hackathonId),
      with: {
        members: {
          with: {
            user: true,
          }
        }
      }
    });
    
    // Transform the data to include member count
    return result.map(team => ({
      ...team,
      members: team.members.length,
    }));
  } catch (error) {
    console.error(`Failed to fetch teams for hackathon ${hackathonId}:`, error);
    return [];
  }
}

// Get tracks for a hackathon
export async function getTracksByHackathonId(hackathonId: number) {
  try {
    const result = await db.query.tracks.findMany({
      where: eq(tracks.hackathonId, hackathonId),
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch tracks for hackathon ${hackathonId}:`, error);
    return [];
  }
}

// Cache the data fetching functions
export const getHackathonByIdCached = unstable_cache(
  getHackathonById,
  ['hackathon-detail']
);

export const getTeamsByHackathonIdCached = unstable_cache(
  getTeamsByHackathonId,
  ['hackathon-teams']
);

export const getTracksByHackathonIdCached = unstable_cache(
  getTracksByHackathonId,
  ['hackathon-tracks']
);

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get status badge color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'published':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-gray-500';
    case 'draft':
      return 'bg-yellow-500';
    default:
      return 'bg-purple-500';
  }
};

// Get registration status badge color
const getRegistrationStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-green-500';
    case 'closed':
      return 'bg-red-500';
    case 'invitation_only':
      return 'bg-purple-500';
    default:
      return 'bg-blue-500';
  }
};

export default async function HackathonPage({ params }: { params: { id: string } }) {
  const hackathonId = parseInt(params.id, 10);
  
  if (isNaN(hackathonId)) {
    notFound();
  }
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    notFound();
  }
  
  const teams = await getTeamsByHackathonIdCached(hackathonId);
  const tracks = await getTracksByHackathonIdCached(hackathonId);
  
  return (
    <main className="pb-12">
      {/* Hero Banner */}
      <div className="relative h-80 w-full">
        {hackathon.banner ? (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${hackathon.banner})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white text-center">
          {hackathon.logo && (
            <img src={hackathon.logo} alt={hackathon.name} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-white" />
          )}
          <h1 className="text-4xl font-bold mb-4">{hackathon.name}</h1>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <span className={`px-3 py-1 ${getStatusColor(hackathon.status)} rounded-full text-sm uppercase`}>
              {hackathon.status}
            </span>
            <span className={`px-3 py-1 ${getRegistrationStatusColor(hackathon.registrationStatus)} rounded-full text-sm uppercase`}>
              Registration {hackathon.registrationStatus}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {hackathon.isVirtual ? 'Virtual' : hackathon.location}
            </span>
          </div>
          <p className="text-lg max-w-3xl">
            {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-end">
          {hackathon.registrationStatus === 'open' && (
            <Button size="lg" asChild>
              <Link href={`/hackathons/${hackathon.id}/register`}>Register Now</Link>
            </Button>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/hackathons/${hackathon.id}/teams`}>Browse Teams</Link>
          </Button>
        </div>

        {/* Pass data to client component for tabs */}
        <TabsClient 
          hackathon={hackathon} 
          teams={teams} 
          tracks={tracks} 
        />
      </div>
    </main>
  );
} 