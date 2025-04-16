"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateLeaderboardPublishStatus } from "@/actions/hackathon";
import { EyeOff, Eye } from "lucide-react";

interface PublishLeaderboardButtonProps {
  hackathonId: string;
  isPublished: boolean;
}

export function PublishLeaderboardButton({ hackathonId, isPublished }: PublishLeaderboardButtonProps) {
  const [published, setPublished] = useState(isPublished);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTogglePublish = async () => {
    setIsLoading(true);
    try {
      await updateLeaderboardPublishStatus(hackathonId, !published);
      setPublished(!published);
      toast({
        title: `Leaderboard ${!published ? "published" : "unpublished"} successfully`,
        description: !published 
          ? "Participants can now view the leaderboard." 
          : "The leaderboard is now hidden from participants.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to update leaderboard status:", error);
      toast({
        title: "Failed to update leaderboard status",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleTogglePublish} 
      disabled={isLoading}
      variant={published ? "destructive" : "default"}
      size="sm"
    >
      {isLoading ? (
        "Updating..."
      ) : published ? (
        <>
          <EyeOff className="mr-2 h-4 w-4" />
          Unpublish Leaderboard
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Publish Leaderboard
        </>
      )}
    </Button>
  );
} 