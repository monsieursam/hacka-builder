"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { removeTeamMember } from '@/actions/teams';
import { toast } from 'sonner';

interface RemoveMemberButtonProps {
  teamId: string;
  hackathonId: string;
  memberUserId: string;
  isOwner: boolean;
  currentUserIsOwner: boolean;
}

export function RemoveMemberButton({
  teamId,
  hackathonId,
  memberUserId,
  isOwner,
  currentUserIsOwner,
}: RemoveMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Don't show removal button for team owners unless current user is hackathon organizer
  if (isOwner && !currentUserIsOwner) {
    return null;
  }

  const handleRemoveMember = async () => {
    setIsLoading(true);
    try {
      const result = await removeTeamMember(teamId, memberUserId, hackathonId);
      
      if (result.success) {
        toast.success('Team member has been removed');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('An error occurred while removing the team member');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
        onClick={() => setIsOpen(true)}
        title="Remove member"
      >
        <X className="h-3 w-3" />
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleRemoveMember();
              }}
              disabled={isLoading}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isLoading ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 