'use server';

import { db } from '@/db';
import { partners } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface PartnerFormData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  hackathonId: string;
}

export async function createPartner(data: PartnerFormData) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Insert the new partner
    const [partner] = await db.insert(partners).values({
      name: data.name,
      description: data.description || null,
      logo: data.logo || null,
      website: data.website || null,
      hackathonId: data.hackathonId,
    }).returning();

    // Revalidate cache
    revalidateTag(`hackathon-${data.hackathonId}`);

    return partner;
  } catch (error) {
    console.error('Failed to create partner:', error);
    throw new Error('Failed to create partner');
  }
}

export async function updatePartner(partnerId: string, data: Partial<PartnerFormData>) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Update the partner
    const [partner] = await db.update(partners)
      .set({
        name: data.name,
        description: data.description,
        logo: data.logo,
        website: data.website,
      })
      .where(eq(partners.id, partnerId))
      .returning();

    // Revalidate cache
    if (data.hackathonId) {
      revalidateTag(`hackathon-${data.hackathonId}`);
    }

    return partner;
  } catch (error) {
    console.error('Failed to update partner:', error);
    throw new Error('Failed to update partner');
  }
}

export async function deletePartner(partnerId: string, hackathonId: string) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Delete the partner
    await db.delete(partners).where(eq(partners.id, partnerId));

    // Revalidate cache
    revalidateTag(`hackathon-${hackathonId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to delete partner:', error);
    throw new Error('Failed to delete partner');
  }
}

export async function getPartnersByHackathon(hackathonId: string) {
  try {
    // Get all partners for a hackathon
    const partnersList = await db
      .select()
      .from(partners)
      .where(eq(partners.hackathonId, hackathonId));

    return partnersList;
  } catch (error) {
    console.error('Failed to get partners:', error);
    throw new Error('Failed to get partners');
  }
} 