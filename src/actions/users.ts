'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or, like, and, desc } from 'drizzle-orm';
import { cache } from 'react';

/**
 * Search for users by name or email
 * @param query The search query (name or email)
 * @param limit Optional limit for results (default: 10)
 * @returns Array of matching users
 */
export async function searchUsers(query: string, limit: number = 10) {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    // Clean the search query and prepare for LIKE
    const searchTerm = `%${query.trim().toLowerCase()}%`;

    const results = await db
      .select()
      .from(users)
      .where(
        or(
          like(users.email, searchTerm),
          like(users.first_name, searchTerm),
          like(users.last_name, searchTerm)
        )
      )
      .limit(limit);

    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * Get a user by ID
 * @param userId The user's ID
 * @returns The user or null if not found
 */
export async function getUserById(userId: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId as any))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get a user by email
 * @param email The user's email
 * @returns The user or null if not found
 */
export async function getUserByEmail(email: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Cached version of getUserById for repeated calls
export const getUserByIdCached = cache(getUserById); 