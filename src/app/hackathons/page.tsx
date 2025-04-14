import { HackathonsList } from './_components/HackathonsList';

import { db } from '@/db';
import { hackathons, HackathonStatus } from '@/db/schema';
import { unstable_cache } from 'next/cache';
import { desc, eq, like } from 'drizzle-orm';

// Get all hackathons with optional filters
export async function getHackathons({
  status,
  search,
  sortBy = 'startDate',
}: {
  status?: HackathonStatus;
  search?: string;
  sortBy?: 'startDate' | 'name';
} = {}) {
  try {
    // Use db.query pattern instead of direct select
    let query = db.query.hackathons.findMany({
      orderBy: sortBy === 'name' ? hackathons.name : desc(hackathons.startDate),
      where: (hackathon, { and, like: likeOp }) => {
        const conditions = [];
        
        if (status) {
          conditions.push(eq(hackathon.status, status));
        }
        
        if (search) {
          conditions.push(likeOp(hackathon.name, `%${search}%`));
        }
        
        return conditions.length ? and(...conditions) : undefined;
      }
    });
    
    return await query;
  } catch (error) {
    console.error('Failed to fetch hackathons:', error);
    return [];
  }
}

// Cached version of getHackathons
export const getHackathonsCached = unstable_cache(
  getHackathons,
  ['hackathons-list']
);

// Get a single hackathon by ID
export async function getHackathonById(id: number) {
  try {
    const result = await db.query.hackathons.findFirst({
      where: eq(hackathons.id, id),
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch hackathon with ID ${id}:`, error);
    return null;
  }
}

// Cached version of getHackathonById
export const getHackathonByIdCached = unstable_cache(
  getHackathonById,
  ['hackathon-detail']
); 

export default async function HackathonsPage() {
  // Fetch hackathons server-side using the cached action
  const hackathons = await getHackathonsCached();
  
  return (
    <main className="py-12 px-4">
      <HackathonsList initialHackathons={hackathons} />
    </main>
  );
} 