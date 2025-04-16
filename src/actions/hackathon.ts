'use server';

import { db } from '@/db';
import { Hackathon, hackathons, Prize, Team, teams, tracks, User, submissions, teamMembers, hackathonStatusEnum, registrationStatusEnum } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidateTag, unstable_cache } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { eq, and, count } from 'drizzle-orm';
import { desc, like } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { asc } from 'drizzle-orm';

// Define a type for form data to avoid TypeScript issues
export interface HackathonFormData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  isVirtual: boolean;
  maxTeamSize: number;
  minTeamSize: number;
  maxParticipants?: number | null;
  maxTeams?: number | null;
  status: string;
  registrationStatus: string;
  showAllSubmissions?: boolean;
  organizerId?: string;
  rules?: string | null;
}

export async function createHackathon(data: HackathonFormData) {
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
      maxTeams: data.maxTeams || null,
      status: data.status as typeof hackathonStatusEnum[number],
      registrationStatus: data.registrationStatus as typeof registrationStatusEnum[number],
      showAllSubmissions: data.showAllSubmissions || false,
      organizerId: data.organizerId!,
      rules: data.rules || null,
    }).returning();

    // Revalidate cache
    revalidateTag('hackathons');

    return hackathon;
  } catch (error) {
    console.error('Failed to create hackathon:', error);
    throw new Error('Failed to create hackathon');
  }
}

export async function updateHackathon(id: string, data: HackathonFormData) {
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
        maxTeams: data.maxTeams || null,
        status: data.status as typeof hackathonStatusEnum[number],
        registrationStatus: data.registrationStatus as typeof registrationStatusEnum[number],
        showAllSubmissions: data.showAllSubmissions !== undefined ? data.showAllSubmissions : hackathon.showAllSubmissions,
        rules: data.rules || null,
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

export async function updateHackathonRules(id: string, rules: string) {
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

    // Update the rules field only
    const [updatedHackathon] = await db.update(hackathons)
      .set({
        rules: rules,
      })
      .where(eq(hackathons.id, id))
      .returning();

    // Revalidate cache
    revalidatePath(`/hackathons/${id}`);
    revalidatePath(`/hackathons/${id}/rules`);

    return updatedHackathon;
  } catch (error) {
    console.error('Failed to update hackathon rules:', error);
    throw new Error('Failed to update hackathon rules');
  }
}

// Get all hackathons with optional filters
export async function getHackathons({
  status,
  search,
  sortBy = 'startDate',
}: {
  status?: typeof hackathonStatusEnum[number];
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

export type TeamWithDetails = Team & {
  members: Array<{
    id: string;
    role: string;
    userId: string;
    joinedAt: Date;
    user: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string;
      image_url: string | null;
    };
  }>;
  submissions: Array<{
    id: string;
    projectName: string | null;
    description: string;
    submittedAt: Date;
  }>;
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

export async function getTeamsByHackathonIdCached(hackathonId: string, includeDetails: boolean = false): Promise<TeamWithMemberCount[] | TeamWithDetails[]> {
  return unstable_cache(
    async () => {
      if (includeDetails) {
        // Return teams with members and submissions
        const teamsWithDetails = await db.query.teams.findMany({
          where: eq(teams.hackathonId, hackathonId),
          with: {
            members: {
              with: {
                user: true
              }
            },
            submissions: true
          },
          orderBy: (teams, { asc }) => [asc(teams.name)]
        });
        
        return teamsWithDetails.map(team => ({
          ...team,
          submissions: team.submissions.map(sub => ({
            id: sub.id,
            projectName: sub.projectName,
            description: sub.description || '',
            submittedAt: sub.submittedAt
          }))
        }));
      } else {
        // Only return basic team info with member count
        const teamsWithMembers = await db.query.teams.findMany({
          where: eq(teams.hackathonId, hackathonId),
          with: {
            members: true
          },
          orderBy: (teams, { asc }) => [asc(teams.name)]
        });
        
        return teamsWithMembers.map(team => ({
          ...team,
          members: team.members.length
        }));
      }
    },
    [`hackathon-teams-${hackathonId}-${includeDetails ? 'detailed' : 'basic'}`]
  )();
}

export const getTracksByHackathonIdCached = unstable_cache(
  getTracksByHackathonId,
  ['hackathon-tracks']
);

// Get submissions by hackathon id and optionally by team id
export async function getSubmissionsByHackathonId(hackathonId: string, teamId?: string) {
  if (teamId) {
    // Get submissions for a specific team
    return db.query.submissions.findMany({
      where: and(
        eq(submissions.teamId, teamId)
      ),
      with: {
        team: true,
        track: true
      }
    });
  } else {
    // Get all submissions for this hackathon by joining with teams
    const result = await db
      .select()
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .leftJoin(tracks, eq(submissions.trackId, tracks.id))
      .where(eq(teams.hackathonId, hackathonId));
    
    // Transform the result to return submissions with team and track info
    return result.map(record => ({
      ...record.submissions,
      team: record.teams,
      track: record.tracks
    }));
  }
}

/**
 * Check if a hackathon has reached its maximum team limit and update its registration status if needed
 * @param hackathonId The hackathon ID to check
 * @returns True if registration was closed, false otherwise
 */
export async function checkAndUpdateHackathonRegistrationStatus(hackathonId: string): Promise<boolean> {
  try {
    // Get the hackathon
    const hackathon = await getHackathonById(hackathonId);
    if (!hackathon || !hackathon.maxTeams || hackathon.registrationStatus !== 'open') {
      return false;
    }

    // Count current teams
    const teamsCount = await db
      .select({ count: count() })
      .from(teams)
      .where(eq(teams.hackathonId, hackathonId));
    
    const currentTeamCount = Number(teamsCount[0]?.count || 0);
    
    // If we've reached the limit, close registration
    if (currentTeamCount >= hackathon.maxTeams) {
      await db.update(hackathons)
        .set({ registrationStatus: 'closed' })
        .where(eq(hackathons.id, hackathonId));
      
      // Revalidate paths
      revalidatePath(`/hackathons/${hackathonId}`);
      revalidatePath(`/hackathons/${hackathonId}/dashboard`);
      revalidatePath(`/hackathons/${hackathonId}/teams`);
      
      console.log(`Closed registration for hackathon ${hackathonId} - maximum teams limit (${hackathon.maxTeams}) reached`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking hackathon registration status:', error);
    return false;
  }
}

/**
 * Delete a hackathon - only available to the hackathon creator
 * @param hackathonId The ID of the hackathon to delete
 * @returns Result of the operation
 */
export async function deleteHackathon(hackathonId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Get the hackathon to check ownership
    const hackathon = await getHackathonById(hackathonId);
    
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    // Ensure the user is the creator of the hackathon
    if (userId !== hackathon.organizerId) {
      return { success: false, error: 'Unauthorized - only the hackathon creator can delete it' };
    }

    // Get all teams for this hackathon to delete their associated records
    const teamsForHackathon = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.hackathonId, hackathonId));
    
    const teamIds = teamsForHackathon.map(t => t.id);

    // Begin a transaction to ensure all related records are deleted
    await db.transaction(async (tx) => {
      // Delete submissions for teams in this hackathon
      if (teamIds.length > 0) {
        await tx.delete(submissions)
          .where(
            // Use in operation if available or multiple or conditions
            sql`${submissions.teamId} IN (${sql.join(teamIds)})`
          );

        // Delete team members
        await tx.delete(teamMembers)
          .where(
            sql`${teamMembers.teamId} IN (${sql.join(teamIds)})`
          );
      }

      // Delete tracks
      await tx.delete(tracks)
        .where(eq(tracks.hackathonId, hackathonId));

      // Delete teams
      await tx.delete(teams)
        .where(eq(teams.hackathonId, hackathonId));

      // Finally delete the hackathon
      await tx.delete(hackathons)
        .where(eq(hackathons.id, hackathonId));
    });

    // Revalidate cache
    revalidatePath('/hackathons');
    revalidateTag('hackathons');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete hackathon:', error);
    return { success: false, error: 'Failed to delete hackathon' };
  }
}