'use server';

import { db } from '@/db';
import { tracks, hackathons } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Get tracks for a hackathon
export async function getTracksForHackathon(hackathonId: string) {
  return await db.query.tracks.findMany({
    where: eq(tracks.hackathonId, hackathonId),
    orderBy: tracks.name
  });
}

// Create a new track
export async function createTrack({
  name,
  description,
  hackathonId,
}: {
  name: string;
  description: string;
  hackathonId: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Verify if the user is the organizer of this hackathon
  const hackathon = await db.query.hackathons.findFirst({
    where: eq(hackathons.id, hackathonId)
  });

  if (!hackathon || hackathon.organizerId !== userId) {
    throw new Error('You do not have permission to create tracks for this hackathon');
  }

  const [newTrack] = await db.insert(tracks).values({
    name,
    description: description || null,
    hackathonId,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  revalidatePath(`/hackathons/${hackathonId}/dashboard/settings`);
  return newTrack;
}

// Update a track
export async function updateTrack({
  id,
  name,
  description,
  hackathonId,
}: {
  id: string;
  name: string;
  description: string;
  hackathonId: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Verify if the user is the organizer of this hackathon
  const hackathon = await db.query.hackathons.findFirst({
    where: eq(hackathons.id, hackathonId)
  });

  if (!hackathon || hackathon.organizerId !== userId) {
    throw new Error('You do not have permission to update tracks for this hackathon');
  }

  const [updatedTrack] = await db.update(tracks)
    .set({
      name,
      description: description || null,
      updatedAt: new Date()
    })
    .where(eq(tracks.id, id))
    .returning();

  revalidatePath(`/hackathons/${hackathonId}/dashboard/settings`);
  return updatedTrack;
}

// Delete a track
export async function deleteTrack(trackId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the track to check the associated hackathon
  const track = await db.query.tracks.findFirst({
    where: eq(tracks.id, trackId),
    with: {
      hackathon: true
    }
  });

  if (!track) {
    throw new Error('Track not found');
  }

  // Verify if the user is the organizer of this hackathon
  if (track.hackathon.organizerId !== userId) {
    throw new Error('You do not have permission to delete tracks for this hackathon');
  }

  await db.delete(tracks).where(eq(tracks.id, trackId));

  revalidatePath(`/hackathons/${track.hackathonId}/dashboard/settings`);
  return { success: true };
} 