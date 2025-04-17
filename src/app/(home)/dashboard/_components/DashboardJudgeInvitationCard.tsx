'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { acceptJudgeInvitation, declineJudgeInvitation } from '@/actions/judges';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface DashboardJudgeInvitationCardProps {
  invitation: {
    id: string;
    isAccepted: boolean;
    invitedAt: string | Date;
    hackathon: {
      id: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
    };
  };
}

export default function DashboardJudgeInvitationCard({ 
  invitation
}: DashboardJudgeInvitationCardProps) {
  const router = useRouter();
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isDeclineLoading, setIsDeclineLoading] = useState(false);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleAccept = async () => {
    setIsAcceptLoading(true);
    
    try {
      const result = await acceptJudgeInvitation(invitation.id);
      
      if (result.success) {
        toast.success('Invitation accepted');
        router.refresh();
        
        // Redirect to the hackathon page
        if (result.hackathonId) {
          router.push(`/hackathons/${result.hackathonId}`);
        }
      } else {
        toast.error(result.error || 'Failed to accept invitation');
      }
    } catch (error) {
      toast.error('An error occurred while accepting the invitation');
      console.error(error);
    } finally {
      setIsAcceptLoading(false);
    }
  };
  
  const handleDecline = async () => {
    setIsDeclineLoading(true);
    
    try {
      // Ask for confirmation before declining
      if (!confirm('Are you sure you want to decline this invitation? This action cannot be undone.')) {
        setIsDeclineLoading(false);
        return;
      }
      
      const result = await declineJudgeInvitation(invitation.id);
      
      if (result.success) {
        toast.success('Invitation declined');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to decline invitation');
      }
    } catch (error) {
      toast.error('An error occurred while declining the invitation');
      console.error(error);
    } finally {
      setIsDeclineLoading(false);
    }
  };
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold mb-2">{invitation.hackathon.name}</h3>
      <p className="text-gray-600 text-sm mb-4">
        {formatDate(new Date(invitation.hackathon.startDate))} - {formatDate(new Date(invitation.hackathon.endDate))}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        You've been invited to judge this hackathon.
      </p>
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
        <span className="text-xs text-gray-500">
          Invited on {formatDate(new Date(invitation.invitedAt))}
        </span>
      </div>
      <Separator className="my-4" />
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDecline}
          disabled={isDeclineLoading || isAcceptLoading}
        >
          {isDeclineLoading ? 'Declining...' : 'Decline'}
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
          onClick={handleAccept}
          disabled={isDeclineLoading || isAcceptLoading}
        >
          {isAcceptLoading ? 'Accepting...' : 'Accept'}
        </Button>
      </div>
    </Card>
  );
} 