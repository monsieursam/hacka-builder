'use server';

import { db } from '@/db';
import { reviews, teams, submissions } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { desc } from 'drizzle-orm';

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
      submission: {
        with: {
          team: {
            with: {
              hackathon: true
            }
          }
        }
      }
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

  // Get the hackathon ID through the team relation
  const hackathonId = review.submission?.team?.hackathon?.id;
  if (hackathonId) {
    revalidatePath(`/hackathons/${hackathonId}/submissions/${review.submissionId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard/submissions`);
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
      submission: {
        with: {
          team: {
            with: {
              hackathon: true
            }
          }
        }
      }
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

  // Get the hackathon ID through the team relation
  const hackathonId = review.submission?.team?.hackathon?.id;
  if (hackathonId) {
    revalidatePath(`/hackathons/${hackathonId}/submissions/${review.submissionId}`);
    revalidatePath(`/hackathons/${hackathonId}/dashboard/submissions`);
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

export async function getTeamRankingsForHackathon(hackathonId: string) {
  // Get all submissions for this hackathon
  const submissions = await db.query.submissions.findMany({
    where: (submissions, { eq, inArray }) => {
      return inArray(
        submissions.teamId,
        db.select({ teamId: teams.id }).from(teams).where(eq(teams.hackathonId, hackathonId))
      );
    },
    with: {
      team: {
        with: {
          members: {
            with: {
              user: true
            }
          }
        }
      },
      reviews: true
    }
  });

  // Calculate average scores and prepare ranking data
  const teamScores = submissions.map(submission => {
    // Calculate average score from all reviews
    const totalScore = submission.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageScore = submission.reviews.length > 0 
      ? Math.round((totalScore / submission.reviews.length) * 10) / 10 // Round to 1 decimal place
      : 0;
    
    // Find the team leader
    const leader = submission.team.members.find(member => member.role === 'leader' || member.role === 'owner');
    
    return {
      id: submission.team.id,
      name: submission.team.name,
      score: averageScore,
      memberCount: submission.team.members.length,
      projectName: submission.projectName,
      trackId: submission.trackId,
      leader: leader ? {
        name: `${leader.user.first_name} ${leader.user.last_name}`,
        image: leader.user.image_url
      } : null,
      reviewCount: submission.reviews.length
    };
  });
  
  // Sort by score (descending) and add rank
  const sortedTeams = teamScores
    .sort((a, b) => b.score - a.score)
    .map((team, index) => ({
      ...team,
      rank: index + 1
    }));
  
  return sortedTeams;
} 