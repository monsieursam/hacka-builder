"use client";

import { useState } from "react";
import { updateLeaderboardPublishStatus } from "@/actions/hackathon";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdvancedSettingsProps {
  hackathonId: string;
  leaderboardPublished: boolean;
}

export function AdvancedSettings({ hackathonId, leaderboardPublished }: AdvancedSettingsProps) {
  const [isPublished, setIsPublished] = useState(leaderboardPublished);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleLeaderboard = async () => {
    setIsLoading(true);
    try {
      await updateLeaderboardPublishStatus(hackathonId, !isPublished);
      setIsPublished(!isPublished);
      toast({
        title: `Leaderboard ${!isPublished ? "published" : "unpublished"} successfully`,
        description: !isPublished 
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Settings</CardTitle>
          <CardDescription>
            Control the visibility of your hackathon's leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="leaderboard-publish">
                  <div className="space-y-1">
                    <p className="font-medium">Publish Leaderboard</p>
                    <p className="text-sm text-gray-500">
                      When enabled, all participants can view the leaderboard rankings. 
                      When disabled, only you as the organizer can view it.
                    </p>
                  </div>
                </Label>
                <Switch
                  id="leaderboard-publish"
                  checked={isPublished}
                  onCheckedChange={handleToggleLeaderboard}
                  disabled={isLoading}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {isPublished
                    ? "The leaderboard is currently visible to all participants."
                    : "The leaderboard is currently only visible to you as the organizer."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleToggleLeaderboard}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : isPublished ? "Hide Leaderboard" : "Publish Leaderboard"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 