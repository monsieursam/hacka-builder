'use server';

import { db } from '@/db';
import { teams, teamMembers, hackathons, submissions, teamInvitations, externalTeamMembers, users, teamJoinRequests } from '@/db/schema';
import { eq, and, sql, countDistinct, count, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getHackathonById, updateHackathon, checkAndUpdateHackathonRegistrationStatus } from '@/actions/hackathon';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';

// Schema for validating request
const createTeamSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
  description: z.string().optional(),
  lookingForMembers: z.boolean().default(true),
  hackathonId: z.string().uuid(),
});

// Schema for updating a team
const updateTeamSchema = z.object({
  teamId: z.string().uuid(),
  hackathonId: z.string().uuid(),
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
  description: z.string().optional(),
  lookingForMembers: z.boolean().default(true),
  projectName: z.string().optional(),
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
  try {
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
  } catch (error) {
    console.error('Failed to fetch user team:', error);
    return null;
  }
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

/**
 * Remove a team from a hackathon (organizer only)
 */
export async function removeTeam(teamId: string, hackathonId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the hackathon exists
    const hackathon = await getHackathonById(hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    // Check if the user is the organizer of the hackathon
    const isOrganizer = hackathon.organizerId === userId;
    if (!isOrganizer) {
      return { success: false, error: 'Only the hackathon organizer can remove teams' };
    }

    // Verify the team exists and belongs to this hackathon
    const team = await db.query.teams.findFirst({
      where: and(
        eq(teams.id, teamId),
        eq(teams.hackathonId, hackathonId)
      )
    });

    if (!team) {
      return { success: false, error: 'Team not found or does not belong to this hackathon' };
    }

    // Begin a transaction to delete the team and related records
    await db.transaction(async (tx) => {
      // First delete submissions for this team
      await tx.delete(submissions)
        .where(eq(submissions.teamId, teamId));

      // Delete team members
      await tx.delete(teamMembers)
        .where(eq(teamMembers.teamId, teamId));

      // Delete the team
      await tx.delete(teams)
        .where(eq(teams.id, teamId));
    });

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${hackathonId}/teams`);

    return { success: true };
  } catch (error) {
    console.error('Error removing team:', error);
    return { success: false, error: 'Failed to remove team' };
  }
}

// Schema for validating team member invitation
const inviteTeamMemberSchema = z.object({
  teamId: z.string().uuid(),
  hackathonId: z.string().uuid(),
  email: z.string().email({ message: "Please provide a valid email address" }),
});

// Schema for adding team member by name
const addTeamMemberByNameSchema = z.object({
  teamId: z.string().uuid(),
  hackathonId: z.string().uuid(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

/**
 * Invite a team member via email
 */
export async function inviteTeamMember(data: z.infer<typeof inviteTeamMemberSchema>) {
  try {
    // Validate input
    const { teamId, hackathonId, email } = inviteTeamMemberSchema.parse(data);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get the team to verify it exists and check permissions
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    
    // Verify the team belongs to the correct hackathon
    if (team.hackathonId !== hackathonId) {
      return { success: false, error: 'Team does not belong to this hackathon' };
    }
    
    // Check if the current user is authorized to invite (team owner or hackathon organizer)
    const isAuthorized = await isTeamOwnerOrHackathonOrganizer(userId, teamId, hackathonId);
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to invite members to this team' };
    }
    
    // Check if the team is already at max capacity
    const hackathon = await getHackathonById(hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }
    
    const currentMembers = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId)
    });
    
    if (currentMembers.length >= hackathon.maxTeamSize) {
      return { success: false, error: 'Team is already at maximum capacity' };
    }
    
    // Find user by email
    const userToInvite = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    if (!userToInvite) {
      return { success: false, error: 'User with this email not found. They need to register first.' };
    }
    
    // Check if the user is already on a team for this hackathon
    const existingTeam = await getUserTeamForHackathon(userToInvite.id, hackathonId);
    if (existingTeam) {
      return { success: false, error: 'This user is already part of a team for this hackathon' };
    }
    
    // Check if the user is already invited to this team
    const existingInvitation = await db.query.teamInvitations.findFirst({
      where: and(
        eq(teamInvitations.teamId, teamId),
        eq(teamInvitations.email, email),
        eq(teamInvitations.status, 'pending')
      )
    });
    
    if (existingInvitation) {
      return { success: false, error: 'This user has already been invited to this team' };
    }
    
    // Create invitation
    await db.insert(teamInvitations).values({
      teamId,
      email,
      invitedById: userId,
      status: 'pending',
    });
    
    // TODO: Send email notification
    
    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}/teams/${teamId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error inviting team member:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to invite team member' };
  }
}

/**
 * Add a team member by name only (no account required)
 */
export async function addTeamMemberByName(data: z.infer<typeof addTeamMemberByNameSchema>) {
  try {
    // Validate input
    const { teamId, hackathonId, name } = addTeamMemberByNameSchema.parse(data);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get the team to verify it exists and check permissions
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    
    // Verify the team belongs to the correct hackathon
    if (team.hackathonId !== hackathonId) {
      return { success: false, error: 'Team does not belong to this hackathon' };
    }
    
    // Check if the current user is authorized to invite (team owner or hackathon organizer)
    const isAuthorized = await isTeamOwnerOrHackathonOrganizer(userId, teamId, hackathonId);
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to add members to this team' };
    }
    
    // Check if the team is already at max capacity
    const hackathon = await getHackathonById(hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }
    
    const currentMembers = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId)
    });
    
    if (currentMembers.length >= hackathon.maxTeamSize) {
      return { success: false, error: 'Team is already at maximum capacity' };
    }
    
    // Create external team member record
    await db.insert(externalTeamMembers).values({
      teamId,
      name,
      addedById: userId,
    });
    
    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}/teams/${teamId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding team member by name:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to add team member' };
  }
}

/**
 * Check if a user is a team owner or hackathon organizer
 */
async function isTeamOwnerOrHackathonOrganizer(userId: string, teamId: string, hackathonId: string): Promise<boolean> {
  try {
    // Check if user is team owner
    const teamMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
        eq(teamMembers.role, 'owner')
      )
    });
    
    if (teamMember) {
      return true;
    }
    
    // Check if user is hackathon organizer
    const hackathon = await getHackathonById(hackathonId);
    return hackathon?.organizerId === userId;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Get a user's team with team members for a specific hackathon
 * @param userId The user's ID
 * @param hackathonId The hackathon ID
 * @returns The team with members and their details or null if the user is not on a team
 */
export async function getUserTeamWithMembersForHackathon(userId: string, hackathonId: string) {
  try {
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
    
    const team = result[0].team;
    
    // Fetch team members with user info
    const teamMembersWithUsers = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        role: teamMembers.role,
        user: users
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, team.id));
    
    return {
      ...team,
      members: Number(result[0].members),
      teamMembers: teamMembersWithUsers
    };
  } catch (error) {
    console.error('Failed to fetch user team with members:', error);
    return null;
  }
}

/**
 * Get a team with its members data
 * @param teamId The team ID
 * @returns The team with members data or null if not found
 */
export async function getTeamWithMembers(teamId: string) {
  try {
    const team = await getTeamById(teamId);
    if (!team) return null;
    
    // Fetch team members with user info
    const teamMembersWithUsers = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        role: teamMembers.role,
        user: users
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, team.id));
    
    return {
      ...team,
      teamMembers: teamMembersWithUsers
    };
  } catch (error) {
    console.error(`Failed to fetch team with members for team ${teamId}:`, error);
    return null;
  }
}

export async function getTeamWithDetailsById(teamId: string) {
  try {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        members: {
          with: {
            user: true
          }
        },
        submissions: {
          columns: {
            id: true,
            projectName: true,
            description: true,
            submittedAt: true
          }
        }
      }
    });
    
    return team;
  } catch (error) {
    console.error('Failed to fetch team details:', error);
    return null;
  }
}

export async function getTeamsWithDetailsForHackathon(hackathonId: string) {
  try {
    return await db.query.teams.findMany({
      where: eq(teams.hackathonId, hackathonId),
      with: {
        members: {
          with: {
            user: true
          }
        },
        submissions: {
          columns: {
            id: true,
            projectName: true,
            description: true,
            submittedAt: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch teams with details:', error);
    return [];
  }
}

export const getTeamsWithDetailsForHackathonCached = unstable_cache(
  getTeamsWithDetailsForHackathon,
  ['teams-with-details'],
  { revalidate: 60 }  // Revalidate every minute
);

/**
 * Request to join a team
 */
export async function requestToJoinTeam(teamId: string, message?: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        error: 'You must be signed in to request to join a team',
        requiresAuth: true
      };
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

    // Check if the user already has a pending request for this team
    const existingRequest = await db.query.teamJoinRequests.findFirst({
      where: and(
        eq(teamJoinRequests.teamId, teamId),
        eq(teamJoinRequests.userId, userId),
        eq(teamJoinRequests.status, 'pending')
      )
    });

    if (existingRequest) {
      return { 
        success: false, 
        error: 'You already have a pending request to join this team' 
      };
    }

    // Check team size limit
    const teamMembersList = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId)
    });
    
    if (teamMembersList.length >= hackathon.maxTeamSize) {
      return { success: false, error: 'Team is already at maximum capacity' };
    }

    // Create join request
    await db.insert(teamJoinRequests).values({
      teamId,
      userId,
      status: 'pending',
      message: message || null,
    });

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${team.hackathonId}`);
    revalidatePath(`/hackathons/${team.hackathonId}/teams`);
    revalidatePath(`/hackathons/${team.hackathonId}/teams/${teamId}`);

    return { 
      success: true, 
      teamId,
      hackathonId: team.hackathonId 
    };
  } catch (error) {
    console.error('Error requesting to join team:', error);
    return { success: false, error: 'Failed to request to join team' };
  }
}

/**
 * Get all join requests for a team
 */
export async function getTeamJoinRequests(teamId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is a team owner or hackathon organizer
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    const isOwnerOrOrganizer = await isTeamOwnerOrHackathonOrganizer(
      userId, 
      teamId, 
      team.hackathonId
    );

    if (!isOwnerOrOrganizer) {
      return { success: false, error: 'Only team owners or hackathon organizers can view join requests' };
    }

    // Get all join requests for this team with user details
    const requests = await db.query.teamJoinRequests.findMany({
      where: eq(teamJoinRequests.teamId, teamId),
      with: {
        user: {
          columns: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            image_url: true,
          }
        }
      },
      orderBy: [desc(teamJoinRequests.createdAt)]
    });

    return { 
      success: true, 
      requests
    };
  } catch (error) {
    console.error('Error getting team join requests:', error);
    return { success: false, error: 'Failed to get team join requests' };
  }
}

/**
 * Accept or reject a team join request
 */
export async function handleJoinRequest(requestId: string, action: 'accept' | 'reject') {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the request
    const request = await db.query.teamJoinRequests.findFirst({
      where: eq(teamJoinRequests.id, requestId),
    });

    if (!request) {
      return { success: false, error: 'Join request not found' };
    }

    // Get the team
    const team = await getTeamById(request.teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Check if user is a team owner or hackathon organizer
    const isOwnerOrOrganizer = await isTeamOwnerOrHackathonOrganizer(
      userId, 
      request.teamId, 
      team.hackathonId
    );

    if (!isOwnerOrOrganizer) {
      return { success: false, error: 'Only team owners or hackathon organizers can handle join requests' };
    }

    // If accepting the request
    if (action === 'accept') {
      // Check if hackathon registration is open
      const hackathon = await getHackathonById(team.hackathonId);
      if (!hackathon) {
        return { success: false, error: 'Hackathon not found' };
      }

      if (hackathon.registrationStatus !== 'open') {
        return { success: false, error: 'Hackathon is not accepting registrations' };
      }

      // Check if the requesting user is already on a team for this hackathon
      const existingTeam = await getUserTeamForHackathon(request.userId, team.hackathonId);
      if (existingTeam) {
        // Update request status to rejected
        await db.update(teamJoinRequests)
          .set({ status: 'rejected', updatedAt: new Date() })
          .where(eq(teamJoinRequests.id, requestId));
          
        return { 
          success: false, 
          error: 'This user has already joined another team' 
        };
      }

      // Check team size limit
      const teamMembersList = await db.query.teamMembers.findMany({
        where: eq(teamMembers.teamId, request.teamId)
      });
      
      if (teamMembersList.length >= hackathon.maxTeamSize) {
        // Update request status to rejected
        await db.update(teamJoinRequests)
          .set({ status: 'rejected', updatedAt: new Date() })
          .where(eq(teamJoinRequests.id, requestId));
          
        return { success: false, error: 'Team is already at maximum capacity' };
      }

      // Add user to the team
      await db.insert(teamMembers).values({
        teamId: request.teamId,
        userId: request.userId,
        role: 'member',
      });

      // Check if team is now full and update lookingForMembers status
      if (teamMembersList.length + 1 >= hackathon.maxTeamSize) {
        await db.update(teams)
          .set({ lookingForMembers: false })
          .where(eq(teams.id, request.teamId));
      }

      // Update request status to accepted
      await db.update(teamJoinRequests)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(teamJoinRequests.id, requestId));
    } else {
      // Update request status to rejected
      await db.update(teamJoinRequests)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(teamJoinRequests.id, requestId));
    }

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${team.hackathonId}`);
    revalidatePath(`/hackathons/${team.hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${team.hackathonId}/teams`);
    revalidatePath(`/hackathons/${team.hackathonId}/teams/${request.teamId}`);

    return { 
      success: true, 
      action,
      teamId: request.teamId,
      hackathonId: team.hackathonId 
    };
  } catch (error) {
    console.error(`Error ${action}ing join request:`, error);
    return { success: false, error: `Failed to ${action} join request` };
  }
}

/**
 * Check if a user has requested to join a team
 */
export async function hasRequestedToJoinTeam(teamId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { hasRequested: false };
    }

    // Check if the user has a pending request for this team
    const request = await db.query.teamJoinRequests.findFirst({
      where: and(
        eq(teamJoinRequests.teamId, teamId),
        eq(teamJoinRequests.userId, userId),
        eq(teamJoinRequests.status, 'pending')
      )
    });

    return { 
      hasRequested: !!request,
      requestId: request?.id
    };
  } catch (error) {
    console.error('Error checking join request status:', error);
    return { hasRequested: false };
  }
}

/**
 * Generate a shareable team invitation link
 */
export async function generateTeamInviteLink(teamId: string, hackathonId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get the team to verify it exists and check permissions
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    
    // Verify the team belongs to the correct hackathon
    if (team.hackathonId !== hackathonId) {
      return { success: false, error: 'Team does not belong to this hackathon' };
    }
    
    // Check if the current user is authorized to invite (team owner or hackathon organizer)
    const isAuthorized = await isTeamOwnerOrHackathonOrganizer(userId, teamId, hackathonId);
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to generate invite links for this team' };
    }
    
    // Generate invite link
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/team/${teamId}?hackathonId=${hackathonId}`;
    
    return { 
      success: true,
      inviteUrl
    };
  } catch (error) {
    console.error('Error generating team invite link:', error);
    return { success: false, error: 'Failed to generate team invite link' };
  }
}

/**
 * Join a team via invitation link
 */
export async function joinTeamViaInviteLink(teamId: string, hackathonId: string) {
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
    
    // Verify the team belongs to the correct hackathon
    if (team.hackathonId !== hackathonId) {
      return { success: false, error: 'Team does not belong to this hackathon' };
    }
    
    // Check if user is already on a team for this hackathon
    const existingTeam = await getUserTeamForHackathon(userId, hackathonId);
    if (existingTeam) {
      return { success: false, error: 'You are already part of a team for this hackathon' };
    }
    
    // Check if the team is already at max capacity
    const hackathon = await getHackathonById(hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }
    
    const currentMembers = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId)
    });
    
    if (currentMembers.length >= hackathon.maxTeamSize) {
      return { success: false, error: 'Team is already at maximum capacity' };
    }
    
    // Add user to the team
    await db.insert(teamMembers).values({
      teamId,
      userId,
      role: 'member'
    });
    
    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard/my-team`);
    revalidatePath(`/hackathons/${hackathonId}/teams/${teamId}`);
    
    return { 
      success: true,
      teamId,
      hackathonId
    };
  } catch (error) {
    console.error('Error joining team via invite link:', error);
    return { success: false, error: 'Failed to join team' };
  }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(teamId: string, memberUserId: string, hackathonId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get the team to verify it exists and check permissions
    const team = await getTeamById(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    
    // Verify the team belongs to the correct hackathon
    if (team.hackathonId !== hackathonId) {
      return { success: false, error: 'Team does not belong to this hackathon' };
    }
    
    // Check if the current user is authorized to remove members (team owner or hackathon organizer)
    const isAuthorized = await isTeamOwnerOrHackathonOrganizer(userId, teamId, hackathonId);
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to remove members from this team' };
    }
    
    // Prevent removing yourself if you're the owner
    const memberToRemove = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, memberUserId)
      )
    });
    
    if (!memberToRemove) {
      return { success: false, error: 'Team member not found' };
    }
    
    if (memberToRemove.role === 'owner' && memberUserId === userId) {
      return { success: false, error: 'Team owner cannot remove themselves. Please transfer ownership first.' };
    }
    
    // Check if attempting to remove the team owner (only hackathon organizer can do this)
    if (memberToRemove.role === 'owner') {
      const hackathon = await getHackathonById(hackathonId);
      if (!hackathon || hackathon.organizerId !== userId) {
        return { success: false, error: 'Only the hackathon organizer can remove a team owner' };
      }
    }
    
    // Remove the team member
    await db.delete(teamMembers)
      .where(and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, memberUserId)
      ));
    
    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard/my-team`);
    revalidatePath(`/hackathons/${hackathonId}/teams/${teamId}`);
    
    return { 
      success: true,
      teamId,
      hackathonId
    };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error: 'Failed to remove team member' };
  }
}

/**
 * Update team details
 */
export async function updateTeam(formData: FormData) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Parse and validate form data
    const rawData = {
      teamId: formData.get('teamId') as string,
      hackathonId: formData.get('hackathonId') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      lookingForMembers: formData.get('lookingForMembers') === 'true',
      projectName: formData.get('projectName') as string,
    };

    const validatedData = updateTeamSchema.parse(rawData);

    // Check if user is authorized to update the team (team owner or hackathon organizer)
    const isAuthorized = await isTeamOwnerOrHackathonOrganizer(
      userId, 
      validatedData.teamId, 
      validatedData.hackathonId
    );

    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to update this team' };
    }

    // Update the team
    const [updatedTeam] = await db.update(teams)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        lookingForMembers: validatedData.lookingForMembers,
        projectName: validatedData.projectName || null,
      })
      .where(eq(teams.id, validatedData.teamId))
      .returning();

    if (!updatedTeam) {
      return { success: false, error: 'Failed to update team' };
    }

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${validatedData.hackathonId}`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/dashboard/my-team`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/teams`);

    return { success: true, team: updatedTeam };
  } catch (error) {
    console.error('Error updating team:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update team' };
  }
} 