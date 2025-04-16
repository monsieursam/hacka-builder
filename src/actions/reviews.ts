'use server';

import { db } from '@/db';
import { reviews } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function createReview({
  submissionId,
  hackathonId,
  content,
  rating,
  userId
}: {
  submissionId: string;
  hackathonId: string;
  content: string;
  rating: number;
  userId: string;
}) {
  // Validate user is authorized to review (should be done in the component, but we re-check here)
  const { userId: authUserId } = await auth();
  
  if (!authUserId || authUserId !== userId) {
    throw new Error('Unauthorized');
  }

  // Create review
  await db.insert(reviews).values({
    submissionId,
    userId,
    content,
    rating,
    createdAt: new Date(),
  });

  revalidatePath(`/hackathons/${hackathonId}/submissions/${submissionId}`);
  revalidatePath(`/hackathons/${hackathonId}/dashboard/submissions`);
}

export async function updateReview({
  reviewId,
  content,
  rating,
  userId
}: {
  reviewId: string;
  content: string;
  rating: number;
  userId: string;
}) {
  // Validate user is authorized to update this review
  const { userId: authUserId } = await auth();
  
  if (!authUserId || authUserId !== userId) {
    throw new Error('Unauthorized');
  }

  // Get the review to revalidate the paths after update
  const review = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.id, reviewId),
      eq(reviews.userId, userId)
    ),
    with: {
      submission: true
    }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Update review
  await db.update(reviews)
    .set({
      content,
      rating,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(reviews.id, reviewId),
        eq(reviews.userId, userId)
      )
    );

  if (review.submission?.hackathonId) {
    revalidatePath(`/hackathons/${review.submission.hackathonId}/submissions/${review.submissionId}`);
    revalidatePath(`/hackathons/${review.submission.hackathonId}/dashboard/submissions`);
  }
}

export async function deleteReview({
  reviewId,
  userId
}: {
  reviewId: string;
  userId: string;
}) {
  // Validate user is authorized to delete this review
  const { userId: authUserId } = await auth();
  
  if (!authUserId || authUserId !== userId) {
    throw new Error('Unauthorized');
  }

  // Get the review to revalidate the paths after deletion
  const review = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.id, reviewId),
      eq(reviews.userId, userId)
    ),
    with: {
      submission: true
    }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Delete review
  await db.delete(reviews)
    .where(
      and(
        eq(reviews.id, reviewId),
        eq(reviews.userId, userId)
      )
    );

  if (review.submission?.hackathonId) {
    revalidatePath(`/hackathons/${review.submission.hackathonId}/submissions/${review.submissionId}`);
    revalidatePath(`/hackathons/${review.submission.hackathonId}/dashboard/submissions`);
  }
}

export async function getReviewByUserAndSubmission({
  userId,
  submissionId
}: {
  userId: string;
  submissionId: string;
}) {
  return db.query.reviews.findFirst({
    where: and(
      eq(reviews.userId, userId),
      eq(reviews.submissionId, submissionId)
    )
  });
}

export async function getReviewsBySubmission(submissionId: string) {
  return db.query.reviews.findMany({
    where: eq(reviews.submissionId, submissionId),
    with: {
      user: true
    },
    orderBy: (reviews, { desc }) => [desc(reviews.createdAt)]
  });
} 