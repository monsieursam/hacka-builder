'use server';

import { db } from '@/db';
import { teams, teamMembers, hackathons } from '@/db/schema';
import { eq, and, sql, countDistinct, count } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getHackathonById, updateHackathon, checkAndUpdateHackathonRegistrationStatus } from '@/actions/hackathon';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Schema for validating request
const createTeamSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
  description: z.string().optional(),
  lookingForMembers: z.boolean().default(true),
  hackathonId: z.string().uuid(),
});

/**
 * Server action to create a new team for a hackathon
 */
export async function createTeam(formData: FormData) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      lookingForMembers: formData.get('lookingForMembers') === 'on',
      hackathonId: formData.get('hackathonId') as string,
    };

    const validatedData = createTeamSchema.parse(rawData);

    // Check if hackathon exists and is accepting registrations
    const hackathon = await getHackathonById(validatedData.hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    if (hackathon.registrationStatus !== 'open') {
      return { success: false, error: 'Hackathon is not accepting registrations' };
    }

    // Check if maximum teams limit has been reached
    if (hackathon.maxTeams) {
      // Count current teams
      const teamsCount = await db
        .select({ count: count() })
        .from(teams)
        .where(eq(teams.hackathonId, validatedData.hackathonId));
      
      const currentTeamCount = Number(teamsCount[0]?.count || 0);
      
      // If we've reached the limit, don't allow new team creation
      if (currentTeamCount >= hackathon.maxTeams) {
        return { 
          success: false, 
          error: 'Maximum number of teams has been reached for this hackathon' 
        };
      }
    }

    // Check if user is already on a team for this hackathon
    const existingTeam = await getUserTeamForHackathon(userId, validatedData.hackathonId);
    if (existingTeam) {
      return { 
        success: false, 
        error: 'You are already part of a team for this hackathon' 
      };
    }

    // Create the team
    const [team] = await db.insert(teams).values({
      name: validatedData.name,
      description: validatedData.description || null,
      hackathonId: validatedData.hackathonId,
      lookingForMembers: validatedData.lookingForMembers,
    }).returning();

    // Add the creator as a team member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId,
      role: 'owner',
    });

    // Check if we need to close registration because max teams limit is reached
    await checkAndUpdateHackathonRegistrationStatus(validatedData.hackathonId);

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${validatedData.hackathonId}`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/teams`);

    // Return success and team data instead of redirecting
    return { 
      success: true, 
      team: team,
      hackathonId: validatedData.hackathonId 
    };
  } catch (error) {
    console.error('Error creating team:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create team' };
  }
}

/**
 * Get a user's team for a specific hackathon
 * @param userId The user's ID
 * @param hackathonId The hackathon ID
 * @returns The team with member count or null if the user is not on a team
 */
export async function getUserTeamForHackathon(userId: string, hackathonId: string) {
  // Find team ID for the user in this hackathon
  const result = await db
    .select({
      team: teams,
      members: countDistinct(teamMembers.userId).as('members')
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(
      and(
        eq(teams.hackathonId, hackathonId),
        eq(teamMembers.userId, userId)
      )
    )
    .groupBy(teams.id);
    
  if (result.length === 0) {
    return null;
  }
  
  return {
    ...result[0].team,
    members: Number(result[0].members)
  };
}

/**
 * Get a team by ID
 * @param teamId The team ID
 * @returns The team or null if not found
 */
export async function getTeamById(teamId: string) {
  try {
    const result = await db
      .select({
        team: teams,
        members: countDistinct(teamMembers.userId).as('members')
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(eq(teams.id, teamId))
      .groupBy(teams.id);
      
    if (result.length === 0) {
      return null;
    }
    
    return {
      ...result[0].team,
      members: Number(result[0].members)
    };
  } catch (error) {
    console.error(`Failed to fetch team ${teamId}:`, error);
    return null;
  }
}

/**
 * Join an existing team for a hackathon
 */
export async function joinTeam(teamId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the team to verify it exists
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Check if hackathon registration is open
    const hackathon = await getHackathonById(team.hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    if (hackathon.registrationStatus !== 'open') {
      return { success: false, error: 'Hackathon is not accepting registrations' };
    }

    // Check if the team is looking for members
    if (!team.lookingForMembers) {
      return { success: false, error: 'This team is not looking for new members' };
    }

    // Check if user is already on a team for this hackathon
    const existingTeam = await getUserTeamForHackathon(userId, team.hackathonId);
    if (existingTeam) {
      return { 
        success: false, 
        error: 'You are already part of a team for this hackathon' 
      };
    }

    // Check team size limit
    const teamMembersList = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId)
    });
    
    if (teamMembersList.length >= hackathon.maxTeamSize) {
      return { success: false, error: 'Team is already at maximum capacity' };
    }

    // Add user to the team
    await db.insert(teamMembers).values({
      teamId,
      userId,
      role: 'member',
    });

    // Check if team is now full and update lookingForMembers status
    if (teamMembersList.length + 1 >= hackathon.maxTeamSize) {
      await db.update(teams)
        .set({ lookingForMembers: false })
        .where(eq(teams.id, teamId));
    }

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${team.hackathonId}`);
    revalidatePath(`/hackathons/${team.hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${team.hackathonId}/teams`);
    revalidatePath(`/hackathons/${team.hackathonId}/teams/${teamId}`);

    return { 
      success: true, 
      teamId,
      hackathonId: team.hackathonId 
    };
  } catch (error) {
    console.error('Error joining team:', error);
    return { success: false, error: 'Failed to join team' };
  }
}

/**
 * Create a team for a specific user as an organizer
 */
export async function createTeamForUser(formData: FormData) {
  try {
    // Check authentication and organizer status
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Parse form data
    const hackathonId = formData.get('hackathonId') as string;
    const targetUserId = formData.get('targetUserId') as string;
    
    if (!hackathonId || !targetUserId) {
      return { success: false, error: 'Missing required fields' };
    }

    // Verify that the current user is an organizer for this hackathon
    const isOrganizer = await checkIfUserIsOrganizer(userId, hackathonId);
    if (!isOrganizer) {
      return { success: false, error: 'Only organizers can create teams for other users' };
    }

    // Parse and validate team data
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      lookingForMembers: formData.get('lookingForMembers') === 'on',
      hackathonId,
    };

    const validatedData = createTeamSchema.parse(rawData);

    // Check if hackathon exists
    const hackathon = await getHackathonById(validatedData.hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    // Check if maximum teams limit has been reached
    if (hackathon.maxTeams) {
      // Count current teams
      const teamsCount = await db
        .select({ count: count() })
        .from(teams)
        .where(eq(teams.hackathonId, validatedData.hackathonId));
      
      const currentTeamCount = Number(teamsCount[0]?.count || 0);
      
      // If we've reached the limit, don't allow new team creation
      if (currentTeamCount >= hackathon.maxTeams) {
        return { 
          success: false, 
          error: 'Maximum number of teams has been reached for this hackathon' 
        };
      }
    }

    // Check if target user is already on a team for this hackathon
    const existingTeam = await getUserTeamForHackathon(targetUserId, validatedData.hackathonId);
    if (existingTeam) {
      return { 
        success: false, 
        error: 'This user is already part of a team for this hackathon' 
      };
    }

    // Create the team
    const [team] = await db.insert(teams).values({
      name: validatedData.name,
      description: validatedData.description || null,
      hackathonId: validatedData.hackathonId,
      lookingForMembers: validatedData.lookingForMembers,
    }).returning();

    // Add the target user as team owner
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: targetUserId,
      role: 'owner',
    });

    // Check if we need to close registration because max teams limit is reached
    await checkAndUpdateHackathonRegistrationStatus(validatedData.hackathonId);

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${validatedData.hackathonId}`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/teams`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/admin`);

    return { 
      success: true, 
      team: team,
      hackathonId: validatedData.hackathonId 
    };
  } catch (error) {
    console.error('Error creating team for user:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create team for user' };
  }
}

/**
 * Helper function to check if a user is an organizer for a hackathon
 */
async function checkIfUserIsOrganizer(userId: string, hackathonId: string) {
  try {
    const hackathon = await getHackathonById(hackathonId);
    return hackathon?.organizerId === userId;
  } catch (error) {
    console.error('Error checking organizer status:', error);
    return false;
  }
} 