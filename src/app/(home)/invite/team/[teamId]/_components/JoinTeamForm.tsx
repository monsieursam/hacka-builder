"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinTeamViaInviteLink } from '@/actions/teams';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JoinTeamFormProps {
  teamId: string;
  hackathonId: string;
}

export default function JoinTeamForm({ teamId, hackathonId }: JoinTeamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinTeam = async () => {
    setIsLoading(true);
    
    try {
      const result = await joinTeamViaInviteLink(teamId, hackathonId);
      
      if (result.success) {
        toast.success('You have successfully joined the team!');
        router.push(`/hackathons/${hackathonId}/dashboard/my-team`);
      } else {
        toast.error(result.error || 'Failed to join the team');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('An error occurred while joining the team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-2">
      <Button 
        onClick={handleJoinTeam}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? 'Joining Team...' : 'Join This Team'}
      </Button>
    </div>
  );
} 