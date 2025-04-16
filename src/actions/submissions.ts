'use server';

import { db } from '@/db';
import { submissions } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { getUserTeamForHackathon } from './teams';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { teamMembers } from '@/db/schema';

export type SubmissionFormData = {
  projectName: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  presentationUrl?: string;
  trackId?: string;
};

/**
 * Create a new hackathon submission for a team
 */
export async function createSubmission(hackathonId: string, data: SubmissionFormData) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the user's team for this hackathon
    const team = await getUserTeamForHackathon(userId, hackathonId);
    
    if (!team) {
      throw new Error('You must be part of a team to submit a project');
    }

    // Create the submission
    const [submission] = await db.insert(submissions).values({
      teamId: team.id,
      trackId: data.trackId || null,
      projectName: data.projectName,
      description: data.description,
      repoUrl: data.repoUrl,
      demoUrl: data.demoUrl || null,
      presentationUrl: data.presentationUrl || null,
    }).returning();

    // Revalidate related paths
    revalidatePath(`/hackathons/${hackathonId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${hackathonId}/submissions`);
    
    return submission;
  } catch (error) {
    console.error('Failed to create submission:', error);
    throw new Error('Failed to create submission. ' + (error instanceof Error ? error.message : ''));
  }
}

/**
 * Update an existing hackathon submission
 */
export async function updateSubmission(submissionId: string, data: Partial<SubmissionFormData>) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the submission with team info to check ownership
    const existingSubmission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      with: {
        team: {
          with: {
            members: {
              where: eq(teamMembers.userId, userId)
            }
          }
        }
      }
    });

    if (!existingSubmission) {
      throw new Error('Submission not found');
    }

    // Verify the user is part of the team that made this submission
    if (existingSubmission.team.members.length === 0) {
      throw new Error('You must be part of the team to update this submission');
    }

    // Update the submission
    const [updatedSubmission] = await db.update(submissions)
      .set({
        projectName: data.projectName !== undefined ? data.projectName : existingSubmission.projectName,
        description: data.description !== undefined ? data.description : existingSubmission.description,
        repoUrl: data.repoUrl !== undefined ? data.repoUrl : existingSubmission.repoUrl,
        demoUrl: data.demoUrl !== undefined ? data.demoUrl : existingSubmission.demoUrl,
        presentationUrl: data.presentationUrl !== undefined ? data.presentationUrl : existingSubmission.presentationUrl,
        trackId: data.trackId !== undefined ? data.trackId : existingSubmission.trackId,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId))
      .returning();

    // Get the hackathon ID from the team info
    const hackathonId = existingSubmission.team.hackathonId;

    // Revalidate related paths
    revalidatePath(`/hackathons/${hackathonId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${hackathonId}/submissions`);
    revalidatePath(`/hackathons/${hackathonId}/submissions/${submissionId}`);
    
    return updatedSubmission;
  } catch (error) {
    console.error('Failed to update submission:', error);
    throw new Error('Failed to update submission. ' + (error instanceof Error ? error.message : ''));
  }
} 