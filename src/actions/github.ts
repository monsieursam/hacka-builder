'use server';

/**
 * Extracts owner and repo name from a GitHub repository URL
 * @param url GitHub repository URL
 * @returns Object containing owner and repo name, or null if invalid
 */
export async function extractGitHubRepoInfo(url: string): Promise<{ owner: string; repo: string; } | null> {
  try {
    if (!url || !url.includes('github.com')) {
      return null;
    }
    
    const urlObj = new URL(url);
    
    // Handle both https://github.com/owner/repo and github.com/owner/repo formats
    if (urlObj.hostname !== 'github.com' && !urlObj.hostname.endsWith('github.com')) {
      return null;
    }
    
    // Extract path components, filtering out empty strings
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // A valid GitHub repo URL should have at least owner and repo in the path
    if (pathParts.length < 2) {
      return null;
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace('.git', '') // Remove .git extension if present
    };
  } catch (error) {
    console.error('Error extracting GitHub repo info:', error);
    return null;
  }
}