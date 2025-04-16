'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { prizes, hackathons } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getHackathonById } from './hackathon';

// Validation schema for prize creation/update
const prizeSchema = z.object({
  name: z.string().min(1, 'Prize name is required'),
  description: z.string().optional(),
  value: z.coerce.number().optional(),
  currency: z.string().optional(),
  rank: z.coerce.number().optional(),
  hackathonId: z.string().uuid('Invalid hackathon ID'),
  trackId: z.string().uuid('Invalid track ID').optional().nullable(),
});

/**
 * Create a new prize for a hackathon
 * @param data Prize data
 * @returns The created prize and operation status
 */
export async function createPrize(data: z.infer<typeof prizeSchema>) {
  try {
    // Validate input
    const validatedData = prizeSchema.parse(data);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if user is the hackathon organizer
    const hackathon = await getHackathonById(validatedData.hackathonId);
    if (!hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }
    
    if (hackathon.organizerId !== userId) {
      return { success: false, error: 'Only the hackathon organizer can add prizes' };
    }
    
    // Create the prize
    const [newPrize] = await db.insert(prizes)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        value: validatedData.value || null,
        currency: validatedData.currency || 'USD',
        rank: validatedData.rank || null,
        hackathonId: validatedData.hackathonId,
        trackId: validatedData.trackId || null,
      })
      .returning();
    
    // Revalidate hackathon pages
    revalidatePath(`/hackathons/${validatedData.hackathonId}`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/prizes`);
    revalidatePath(`/hackathons/${validatedData.hackathonId}/dashboard`);
    
    return { success: true, prize: newPrize };
  } catch (error) {
    console.error('Error creating prize:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid prize data', validationErrors: error.errors };
    }
    return { success: false, error: 'Failed to create prize' };
  }
}

/**
 * Update an existing prize
 * @param prizeId The ID of the prize to update
 * @param data The updated prize data
 * @returns Operation status and updated prize
 */
export async function updatePrize(prizeId: string, data: z.infer<typeof prizeSchema>) {
  try {
    // Validate input
    const validatedData = prizeSchema.parse(data);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get the current prize to check permissions
    const existingPrize = await db.query.prizes.findFirst({
      where: eq(prizes.id, prizeId),
      with: {
        hackathon: true,
      },
    });
    
    if (!existingPrize) {
      return { success: false, error: 'Prize not found' };
    }
    
    // Check if user is the hackathon organizer
    if (existingPrize.hackathon.organizerId !== userId) {
      return { success: false, error: 'Only the hackathon organizer can update prizes' };
    }
    
    // Update the prize
    const [updatedPrize] = await db.update(prizes)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        value: validatedData.value || null,
        currency: validatedData.currency || 'USD',
        rank: validatedData.rank || null,
        trackId: validatedData.trackId || null,
      })
      .where(eq(prizes.id, prizeId))
      .returning();
    
    // Revalidate hackathon pages
    revalidatePath(`/hackathons/${existingPrize.hackathonId}`);
    revalidatePath(`/hackathons/${existingPrize.hackathonId}/prizes`);
    revalidatePath(`/hackathons/${existingPrize.hackathonId}/dashboard`);
    
    return { success: true, prize: updatedPrize };
  } catch (error) {
    console.error('Error updating prize:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid prize data', validationErrors: error.errors };
    }
    return { success: false, error: 'Failed to update prize' };
  }
}

/**
 * Delete a prize
 * @param prizeId The ID of the prize to delete
 * @returns Operation status
 */
export async function deletePrize(prizeId: string) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get the current prize to check permissions
    const existingPrize = await db.query.prizes.findFirst({
      where: eq(prizes.id, prizeId),
      with: {
        hackathon: true,
      },
    });
    
    if (!existingPrize) {
      return { success: false, error: 'Prize not found' };
    }
    
    // Check if user is the hackathon organizer
    if (existingPrize.hackathon.organizerId !== userId) {
      return { success: false, error: 'Only the hackathon organizer can delete prizes' };
    }
    
    // Delete the prize
    await db.delete(prizes)
      .where(eq(prizes.id, prizeId));
    
    // Revalidate hackathon pages
    revalidatePath(`/hackathons/${existingPrize.hackathonId}`);
    revalidatePath(`/hackathons/${existingPrize.hackathonId}/prizes`);
    revalidatePath(`/hackathons/${existingPrize.hackathonId}/dashboard`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting prize:', error);
    return { success: false, error: 'Failed to delete prize' };
  }
}

/**
 * Get prizes for a hackathon
 * @param hackathonId The hackathon ID
 * @returns List of prizes
 */
export async function getPrizesByHackathonId(hackathonId: string) {
  try {
    const result = await db.query.prizes.findMany({
      where: eq(prizes.hackathonId, hackathonId),
      orderBy: (prizes, { asc }) => [asc(prizes.rank)],
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch prizes for hackathon ${hackathonId}:`, error);
    return [];
  }
} 