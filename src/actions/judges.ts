'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { hackathons, judges, users } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for inviting a judge
const inviteJudgeSchema = z.object({
  hackathonId: z.string().uuid(),
  email: z.string().email(),
});

// Validation schema for removing a judge
const removeJudgeSchema = z.object({
  judgeId: z.string().uuid(),
  hackathonId: z.string().uuid(),
});

/**
 * Invite a judge to a hackathon
 */
export async function inviteJudge(data: z.infer<typeof inviteJudgeSchema>) {
  try {
    // Validate the input
    const { hackathonId, email } = inviteJudgeSchema.parse(data);

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if the user is the organizer of the hackathon
    const hackathon = await db.query.hackathons.findFirst({
      where: eq(hackathons.id, hackathonId),
    });

    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    if (hackathon.organizerId !== userId) {
      return { success: false, error: 'Only the organizer can invite judges' };
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { 
        success: false, 
        error: 'User not found. They need to sign up first.' 
      };
    }

    // Check if the user is already a judge for this hackathon
    const existingJudge = await db.query.judges.findFirst({
      where: and(
        eq(judges.hackathonId, hackathonId),
        eq(judges.userId, user.id)
      ),
    });

    if (existingJudge) {
      return { 
        success: false, 
        error: 'This user is already a judge for this hackathon' 
      };
    }

    // Create the judge entry
    const [newJudge] = await db.insert(judges)
      .values({
        hackathonId,
        userId: user.id,
        isAccepted: false,
      })
      .returning();

    // Fetch the judge with user information
    const judgeWithUser = await db.query.judges.findFirst({
      where: eq(judges.id, newJudge.id),
      with: {
        user: true,
      },
    });

    // TODO: Send an email notification to the judge

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}/judges`);
    revalidatePath(`/hackathons/${hackathonId}`);

    return { 
      success: true, 
      judge: judgeWithUser 
    };
  } catch (error) {
    console.error('Error inviting judge:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }
    return { success: false, error: 'Failed to invite judge' };
  }
}

/**
 * Remove a judge from a hackathon
 */
export async function removeJudge(data: z.infer<typeof removeJudgeSchema>) {
  try {
    // Validate the input
    const { judgeId, hackathonId } = removeJudgeSchema.parse(data);

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if the user is the organizer of the hackathon
    const hackathon = await db.query.hackathons.findFirst({
      where: eq(hackathons.id, hackathonId),
    });

    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    if (hackathon.organizerId !== userId) {
      return { success: false, error: 'Only the organizer can remove judges' };
    }

    // Check if the judge exists
    const judge = await db.query.judges.findFirst({
      where: and(
        eq(judges.id, judgeId),
        eq(judges.hackathonId, hackathonId)
      ),
    });

    if (!judge) {
      return { success: false, error: 'Judge not found' };
    }

    // Delete the judge
    await db.delete(judges)
      .where(eq(judges.id, judgeId));

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${hackathonId}/judges`);
    revalidatePath(`/hackathons/${hackathonId}`);

    return { success: true };
  } catch (error) {
    console.error('Error removing judge:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }
    return { success: false, error: 'Failed to remove judge' };
  }
}

/**
 * Accept a judge invitation
 */
export async function acceptJudgeInvitation(judgeId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find the judge invitation
    const judge = await db.query.judges.findFirst({
      where: eq(judges.id, judgeId),
      with: {
        hackathon: true,
      },
    });

    if (!judge) {
      return { success: false, error: 'Invitation not found' };
    }

    // Check if the user is the invited judge
    if (judge.userId !== userId) {
      return { success: false, error: 'You are not authorized to accept this invitation' };
    }

    // Check if the invitation is already accepted
    if (judge.isAccepted) {
      return { success: false, error: 'This invitation has already been accepted' };
    }

    // Update the judge entry
    await db.update(judges)
      .set({
        isAccepted: true,
        acceptedAt: new Date(),
      })
      .where(eq(judges.id, judgeId));

    // Revalidate relevant paths
    revalidatePath(`/hackathons/${judge.hackathonId}/judges`);
    revalidatePath(`/hackathons/${judge.hackathonId}`);

    return { 
      success: true, 
      hackathonId: judge.hackathonId 
    };
  } catch (error) {
    console.error('Error accepting judge invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}

/**
 * Get all judge invitations for a user
 */
export async function getJudgeInvitationsForUser(userId: string) {
  try {
    if (!userId) {
      return [];
    }
    
    const judgeInvitations = await db.query.judges.findMany({
      where: eq(judges.userId, userId),
      with: {
        hackathon: true,
      },
      orderBy: [desc(judges.invitedAt)]
    });
    
    return judgeInvitations;
  } catch (error) {
    console.error('Error getting judge invitations:', error);
    return [];
  }
}

/**
 * Get all judges for a hackathon
 */
export async function getJudgesForHackathon(hackathonId: string) {
  try {
    if (!hackathonId) {
      return [];
    }
    
    const hackathonJudges = await db.query.judges.findMany({
      where: eq(judges.hackathonId, hackathonId),
      with: {
        user: true,
      },
      orderBy: [desc(judges.createdAt)]
    });
    
    return hackathonJudges;
  } catch (error) {
    console.error('Error getting judges for hackathon:', error);
    return [];
  }
} 