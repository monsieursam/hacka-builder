'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { acceptJudgeInvitation, declineJudgeInvitation } from '@/actions/judges';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin } from 'lucide-react';

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface JudgeInvitationCardProps {
  invitation: {
    id: string;
    isAccepted: boolean;
    invitedAt: string | Date;
    hackathon: {
      id: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      location: string;
      isVirtual: boolean;
    };
  };
}

export default function JudgeInvitationCard({ invitation }: JudgeInvitationCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeclineLoading, setIsDeclineLoading] = useState(false);
  
  const handleAccept = async () => {
    setIsLoading(true);
    
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
      setIsLoading(false);
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
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold">{invitation.hackathon.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="h-4 w-4" />
            {formatDate(new Date(invitation.hackathon.startDate))} - {formatDate(new Date(invitation.hackathon.endDate))}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {invitation.hackathon.isVirtual ? 'Virtual' : invitation.hackathon.location}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            You've been invited to judge this hackathon.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Invited on {formatDate(new Date(invitation.invitedAt))}
          </p>
        </div>
        
        <div>
          {invitation.isAccepted ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Accepted
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
        {!invitation.isAccepted && (
          <Button 
            variant="outline" 
            onClick={handleDecline} 
            disabled={isLoading || isDeclineLoading}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            {isDeclineLoading ? 'Declining...' : 'Decline'}
          </Button>
        )}
        <Button 
          variant="default" 
          onClick={handleAccept} 
          disabled={invitation.isAccepted || isLoading || isDeclineLoading}
        >
          {isLoading ? 'Accepting...' : invitation.isAccepted ? 'Accepted' : 'Accept Invitation'}
        </Button>
      </CardFooter>
    </Card>
  );
} 