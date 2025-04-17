'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { createReview, updateReview, deleteReview } from "@/actions/reviews";

interface SubmissionReviewProps {
  submissionId: string;
  hackathonId: string;
  userId: string;
  existingReview?: {
    id: string;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date | null;
  } | null;
  userRole: 'judge' | 'team_member' | 'organizer';
  onReviewComplete?: () => void;
}

export function SubmissionReview({
  submissionId,
  hackathonId,
  userId,
  existingReview,
  userRole,
  onReviewComplete,
}: SubmissionReviewProps) {
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [review, setReview] = useState(existingReview?.content || '');
  const [rating, setRating] = useState<string>(existingReview?.rating.toString() || '75');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!review.trim()) {
      toast.error('Review content cannot be empty');
      return;
    }

    // Validate rating is between 1 and 100
    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 100) {
      toast.error('Rating must be a number between 1 and 100');
      return;
    }

    setIsLoading(true);

    try {
      if (existingReview) {
        // Update existing review
        await updateReview({
          reviewId: existingReview.id,
          content: review,
          rating: numericRating,
          userId
        });
        toast.success('Review updated successfully');
      } else {
        // Create new review
        await createReview({
          submissionId,
          hackathonId,
          content: review,
          rating: numericRating,
          userId
        });
        toast.success('Review submitted successfully');
      }
      
      setIsEditing(false);
      
      // Call the callback if provided
      if (onReviewComplete) {
        onReviewComplete();
      }
    } catch (error) {
      toast.error('Failed to save review');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    setIsLoading(true);
    
    try {
      await deleteReview({
        reviewId: existingReview.id,
        userId
      });
      toast.success('Review deleted successfully');
      // Reset the form for a new review
      setReview('');
      setRating('75');
      setIsEditing(true);
      
      // Call the callback if provided
      if (onReviewComplete) {
        onReviewComplete();
      }
    } catch (error) {
      toast.error('Failed to delete review');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate the percentage for the rating display
  const ratingPercentage = existingReview ? (existingReview.rating / 100) * 100 : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? 'Your Review' : 'Add Your Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-100)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="100"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Enter a score between 1 (poor) and 100 (excellent)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review">Review</Label>
              <Textarea
                id="review"
                placeholder="Write your review here..."
                rows={5}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${ratingPercentage}%` }}
                  />
                </div>
              </div>
              <span className="font-semibold">{existingReview?.rating}/100</span>
              <span className="text-sm text-gray-500">
                {existingReview && existingReview.updatedAt
                  ? `Updated on ${formatDate(existingReview.updatedAt)}`
                  : existingReview
                  ? `Added on ${formatDate(existingReview.createdAt)}`
                  : ''}
              </span>
            </div>
            
            <p className="whitespace-pre-line text-gray-700">
              {existingReview?.content}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            {existingReview && (
              <Button
                variant="ghost"
                onClick={() => {
                  setReview(existingReview.content);
                  setRating(existingReview.rating.toString());
                  setIsEditing(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isLoading}>
              {existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Edit Review
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
} 