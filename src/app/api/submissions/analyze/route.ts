import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractGitHubRepoInfo } from '@/actions/github';
import { experimental_createMCPClient, generateText, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { openai } from '@ai-sdk/openai';
import { getSubmissionById } from '@/actions/submissions';
import { getJudgeForUser } from '@/actions/judges';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await req.json();
    const { submissionId, projectName, description, repositoryUrl, prompt } = body;
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }
    
    // Verify the submission exists
    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Check if the user is a judge for this hackathon
    const hackathonId = submission.team.hackathonId;
    const isJudge = await getJudgeForUser(userId, hackathonId);
    
    if (!isJudge) {
      return NextResponse.json({ error: 'Unauthorized - Only judges can analyze submissions' }, { status: 403 });
    }
    
    // Set up MCP client for repository analysis if a repo URL is provided
    let mcpClient = null;
    let tools = {};
    
    if (repositoryUrl) {
      const repoInfo = await extractGitHubRepoInfo(repositoryUrl);
      
      if (repoInfo) {
        try {
          console.log(`Setting up GitHub MCP client for ${repoInfo.owner}/${repoInfo.repo}`);
          
        
          mcpClient = await experimental_createMCPClient({ transport:
            {
                type: 'sse',
                url: process.env.GITHUB_MCP_SERVER_URL || 'http://localhost:3000',
                headers: {
                    'Authorization': `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
                }
            }
           });

          
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

    const henancedPromptWithToolUsage = `
    You are an expert judge for hackathon projects. Provide detailed, constructive feedback.
    You can use the following tools to analyze the submission:
    'get_file_contents', 'list_commits', 'list_files', 'list_users'
    You can use the tools to get more information about the submission.

    Here is the prompt:
    ${prompt}
    `
    
    // Use AI SDK to analyze the submission with streamText
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      messages: [
        { role: 'system', content: 'You are an expert judge for hackathon projects. Provide detailed, constructive feedback.' },
        { role: 'user', content: henancedPromptWithToolUsage || `Please analyze this hackathon submission without the prompt specifically provided.` }
      ],
      tools,
      // When streaming, the client should be closed after the response is finished
    });

    console.log(result);
    // Return the streaming response
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in analyze submission route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 