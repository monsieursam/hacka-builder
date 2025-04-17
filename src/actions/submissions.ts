'use server';

import { db } from '@/db';
import { submissions } from '@/db/schema';
import { auth, getAuth } from '@clerk/nextjs/server';
import { getUserTeamForHackathon } from './teams';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { teamMembers } from '@/db/schema';
import { experimental_createMCPClient, generateText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

import { openai } from '@ai-sdk/openai';
import { extractGitHubRepoInfo } from './github';
import { getJudgeForUser } from './judges';

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

/**
 * Delete a submission
 */
export async function deleteSubmission(submissionId: string) {
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
      throw new Error('You must be part of the team to delete this submission');
    }

    // Get the hackathon ID for revalidation later
    const hackathonId = existingSubmission.team.hackathonId;

    // Delete the submission
    await db.delete(submissions)
      .where(eq(submissions.id, submissionId));

    // Revalidate related paths
    revalidatePath(`/hackathons/${hackathonId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard`);
    revalidatePath(`/hackathons/${hackathonId}/submissions`);
    
    return { success: true, hackathonId };
  } catch (error) {
    console.error('Failed to delete submission:', error);
    throw new Error('Failed to delete submission. ' + (error instanceof Error ? error.message : ''));
  }
}

/**
 * Get a submission by ID
 */
export async function getSubmissionById(submissionId: string) {
  try {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      with: {
        team: true,
        track: true
      }
    });
    
    return submission;
  } catch (error) {
    console.error('Failed to get submission:', error);
    return null;
  }
}

/**
 * Analyze a submission using AI
 */
export async function analyzeSubmission(data: {
  submissionId: string;
  projectName: string;
  description: string;
  repositoryUrl: string;
  prompt: string;
}) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // Extract data from the request
    const { submissionId, projectName, description, repositoryUrl, prompt } = data;
    
    if (!submissionId) {
      throw new Error('Missing submission ID');
    }
    
    // Verify the submission exists
    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    // Check if the user is a judge for this hackathon
    const hackathonId = submission.team.hackathonId;
    const isJudge = await getJudgeForUser(userId, hackathonId);
    
    if (!isJudge) {
      throw new Error('Unauthorized - Only judges can analyze submissions');
    }
    
    // Set up MCP client for repository analysis if a repo URL is provided
    let mcpClient = null;
    let tools = {};
    
    if (repositoryUrl) {
      const repoInfo = await extractGitHubRepoInfo(repositoryUrl);
      
      if (repoInfo) {
        try {
          console.log(`Setting up GitHub MCP client for ${repoInfo.owner}/${repoInfo.repo}`);
          
          // Initialize MCP client with GitHub's official MCP server
          const transport = new Experimental_StdioMCPTransport({
            command: '/Users/samuelmamane/Documents/github-mcp-server/github-mcp-server',
            args: ['stdio'],
            env: {
              GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '',
            },
            cwd: process.cwd(), // or the directory where your server is
          });
        
          const mcpClient = await experimental_createMCPClient({ transport });
          
          // Get tools from the MCP client
          tools = await mcpClient.tools();
          
          // Log available tools for debugging
          console.log('Available tools:', Object.keys(tools));
          console.log('Successfully connected to GitHub MCP server');
        } catch (error) {
          console.error('Failed to set up GitHub MCP client:', error);
          // Continue without MCP if there's an error - we'll fall back to standard analysis
        }
      }
    }
    
    // Create the default prompt if not provided
    const defaultPrompt = `
Please analyze this hackathon submission:
${repositoryUrl ? `Repository URL: ${repositoryUrl}` : ''}

Provide detailed feedback on:
1. Introduction about the project
2. Technical implementation and code quality
3. Creativity and innovation
4. Potential impact and usefulness
5. Overall strengths and areas for improvement
6. Suggested score (1-100) with justification
`;

    // Create the prompt with details and context
    const enhancedPrompt = prompt || defaultPrompt;
    
    // Use AI SDK to analyze the submission
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      messages: [
        { role: 'system', content: 'You are an expert judge for hackathon projects. Provide detailed, constructive feedback.' },
        { role: 'user', content: enhancedPrompt }
      ],
      tools,
    });
    
    // Ensure we close the MCP client after analysis is complete
    if (mcpClient) {
      await mcpClient.close();
    }
    
    // Return the analysis result as JSON
    return result;
  } catch (error) {
    console.error('Failed to analyze submission:', error);
    throw new Error('Failed to analyze submission. ' + (error instanceof Error ? error.message : ''));
  }
} 