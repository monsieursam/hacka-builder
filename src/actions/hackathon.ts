'use server';

import { db } from '@/db';
import { Hackathon, hackathons, Prize, Team, teams, tracks, User } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidateTag, unstable_cache } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { HackathonStatus } from '@/db/schema';
import { desc, like } from 'drizzle-orm';

export async function createHackathon(data: Partial<Hackathon>) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Ensure the user can only create a hackathon for themselves
    if (userId !== data.organizerId) {
      throw new Error('Unauthorized');
    }

    // Insert the new hackathon
    const [hackathon] = await db.insert(hackathons).values({
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      isVirtual: data.isVirtual,
      maxTeamSize: data.maxTeamSize,
      minTeamSize: data.minTeamSize,
      maxParticipants: data.maxParticipants || null,
      status: data.status,
      registrationStatus: data.registrationStatus,
      organizerId: data.organizerId,
    }).returning();

    // Revalidate cache
    revalidateTag('hackathons');

    return hackathon;
  } catch (error) {
    console.error('Failed to create hackathon:', error);
    throw new Error('Failed to create hackathon');
  }
}

export async function updateHackathon(id: string, data: Omit<Hackathon, 'organizerId'>) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the hackathon to check ownership
    const hackathon = await db.query.hackathons.findFirst({
      where: eq(hackathons.id, id)
    });

    if (!hackathon) {
      throw new Error('Hackathon not found');
    }

    // Ensure the user can only update their own hackathon
    if (userId !== hackathon.organizerId) {
      throw new Error('Unauthorized');
    }

    // Update the hackathon
    const [updatedHackathon] = await db.update(hackathons)
      .set({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        isVirtual: data.isVirtual,
        maxTeamSize: data.maxTeamSize,
        minTeamSize: data.minTeamSize,
        maxParticipants: data.maxParticipants || null,
        status: data.status,
        registrationStatus: data.registrationStatus,
      })
      .where(eq(hackathons.id, id))
      .returning();

    // Revalidate cache
    revalidatePath(`/hackathons/${id}`);
    revalidatePath('/hackathons');

    return updatedHackathon;
  } catch (error) {
    console.error('Failed to update hackathon:', error);
    throw new Error('Failed to update hackathon');
  }
} 



// Get all hackathons with optional filters
export async function getHackathons({
  status,
  search,
  sortBy = 'startDate',
}: {
  status?: HackathonStatus;
  search?: string;
  sortBy?: 'startDate' | 'name';
} = {}) {
  try {
    // Use db.query pattern instead of direct select
    let query = db.query.hackathons.findMany({
      orderBy: sortBy === 'name' ? hackathons.name : desc(hackathons.startDate),
      where: (hackathon, { and, like: likeOp }) => {
        const conditions = [];
        
        if (status) {
          conditions.push(eq(hackathon.status, status));
        }
        
        if (search) {
          conditions.push(likeOp(hackathon.name, `%${search}%`));
        }
        
        return conditions.length ? and(...conditions) : undefined;
      }
    });
    
    return await query;
  } catch (error) {
    console.error('Failed to fetch hackathons:', error);
    return [];
  }
}

// Cached version of getHackathons
export const getHackathonsCached = unstable_cache(
  getHackathons,
  ['hackathons-list']
);

// Cached version of getHackathonById,



export type HackathonWithOrganizer = Hackathon & {
    organizer: User;
    prizes: Prize[];
  };
  
  export async function getHackathonById(id: string): Promise<HackathonWithOrganizer | undefined | null> {
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

  export const getHackathonByIdCached = unstable_cache(
    getHackathonById,
    ['hackathon-detail'],
  ); 
  
  export type TeamWithMemberCount = Team & {
    members: number;
  };
  
  export async function getTeamsByHackathonId(hackathonId: string): Promise<TeamWithMemberCount[]> {
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
  export async function getTracksByHackathonId(hackathonId: string) {
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
  
  export const getTeamsByHackathonIdCached = unstable_cache(
    getTeamsByHackathonId,
    ['hackathon-teams']
  );
  
  export const getTracksByHackathonIdCached = unstable_cache(
    getTracksByHackathonId,
    ['hackathon-tracks']
  );