'use server';

import { db } from '@/db';
import { resources } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { getHackathonById } from './hackathon';

export type ResourceFormData = {
  title: string;
  url: string;
  description?: string;
  category: string;
  order?: number;
};

/**
 * Get resources for a hackathon
 */
export async function getResourcesByHackathonId(hackathonId: string) {
  try {
    return await db.query.resources.findMany({
      where: eq(resources.hackathonId, hackathonId),
      orderBy: [
        resources.category,
        resources.order
      ]
    });
  } catch (error) {
    console.error(`Failed to fetch resources for hackathon ${hackathonId}:`, error);
    return [];
  }
}

/**
 * Create a new resource for a hackathon
 */
export async function createResource(hackathonId: string, data: ResourceFormData) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Verify the user is an organizer for this hackathon
    const hackathon = await getHackathonById(hackathonId);
    
    if (!hackathon || hackathon.organizerId !== userId) {
      throw new Error('Unauthorized - only organizers can add resources');
    }

    // Insert the new resource
    const [resource] = await db.insert(resources).values({
      hackathonId,
      title: data.title,
      url: data.url,
      description: data.description || null,
      category: data.category,
      order: data.order || 0,
    }).returning();

    // Revalidate paths
    revalidatePath(`/hackathons/${hackathonId}/dashboard/resources`);
    
    return resource;
  } catch (error) {
    console.error('Failed to create resource:', error);
    throw new Error('Failed to create resource. ' + (error instanceof Error ? error.message : ''));
  }
}

/**
 * Update an existing resource
 */
export async function updateResource(resourceId: string, data: Partial<ResourceFormData>) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the resource to check ownership
    const resource = await db.query.resources.findFirst({
      where: eq(resources.id, resourceId),
      with: {
        hackathon: true
      }
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Verify the user is an organizer for this hackathon
    if (resource.hackathon.organizerId !== userId) {
      throw new Error('Unauthorized - only organizers can modify resources');
    }

    // Update the resource
    const [updatedResource] = await db.update(resources)
      .set({
        title: data.title !== undefined ? data.title : resource.title,
        url: data.url !== undefined ? data.url : resource.url,
        description: data.description !== undefined ? data.description : resource.description,
        category: data.category !== undefined ? data.category : resource.category,
        order: data.order !== undefined ? data.order : resource.order,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, resourceId))
      .returning();

    // Revalidate paths
    revalidatePath(`/hackathons/${resource.hackathonId}/dashboard/resources`);
    
    return updatedResource;
  } catch (error) {
    console.error('Failed to update resource:', error);
    throw new Error('Failed to update resource. ' + (error instanceof Error ? error.message : ''));
  }
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId: string) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the resource to check ownership
    const resource = await db.query.resources.findFirst({
      where: eq(resources.id, resourceId),
      with: {
        hackathon: true
      }
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Verify the user is an organizer for this hackathon
    if (resource.hackathon.organizerId !== userId) {
      throw new Error('Unauthorized - only organizers can delete resources');
    }

    // Delete the resource
    await db.delete(resources)
      .where(eq(resources.id, resourceId));

    // Revalidate paths
    revalidatePath(`/hackathons/${resource.hackathonId}/dashboard/resources`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete resource:', error);
    throw new Error('Failed to delete resource. ' + (error instanceof Error ? error.message : ''));
  }
} 