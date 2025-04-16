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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

export function SubmissionReview({
  submissionId,
  hackathonId,
  userId,
  existingReview,
  userRole,
}: SubmissionReviewProps) {
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [review, setReview] = useState(existingReview?.content || '');
  const [rating, setRating] = useState<string>(existingReview?.rating.toString() || '5');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!review.trim()) {
      toast.error('Review content cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      if (existingReview) {
        // Update existing review
        await updateReview({
          reviewId: existingReview.id,
          content: review,
          rating: parseInt(rating),
          userId
        });
        toast.success('Review updated successfully');
      } else {
        // Create new review
        await createReview({
          submissionId,
          hackathonId,
          content: review,
          rating: parseInt(rating),
          userId
        });
        toast.success('Review submitted successfully');
      }
      
      setIsEditing(false);
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
      setRating('5');
      setIsEditing(true);
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
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={rating}
                onValueChange={setRating}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
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
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < (existingReview?.rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
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