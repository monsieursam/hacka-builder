'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRound, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getTeamJoinRequests, handleJoinRequest } from '@/actions/teams';
import { toast } from '@/lib/toast';

type TeamJoinRequest = {
  id: string;
  teamId: string;
  userId: string;
  status: string;
  message: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    image_url: string | null;
  };
};

type TeamJoinRequestsProps = {
  teamId: string;
  hackathonId: string;
};

export function TeamJoinRequests({ teamId, hackathonId }: TeamJoinRequestsProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const result = await getTeamJoinRequests(teamId);
        if (result.success && result.requests) {
          setRequests(result.requests as TeamJoinRequest[]);
        } else {
          // Handle error - could be permissions or other issues
          console.error('Failed to fetch join requests:', result.error);
        }
      } catch (error) {
        console.error('Error fetching join requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [teamId]);

  // Handle accept or reject
  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setActionInProgress(requestId);
      const result = await handleJoinRequest(requestId, action);
      
      if (result.success) {
        // Update local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === requestId 
              ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' } 
              : req
          )
        );
        
        // Show toast
        toast({
          title: action === 'accept' ? 'Request accepted!' : 'Request rejected',
          description: action === 'accept' 
            ? 'The user has been added to your team.' 
            : 'The join request has been rejected.',
        });
        
        // Refresh relevant data
        router.refresh();
      } else {
        toast({
          title: 'Action failed',
          description: result.error || `Failed to ${action} the request.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Get pending requests
  const pendingRequests = requests.filter(req => req.status === 'pending');

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Join Requests</h2>
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Join Requests</h2>
        <p className="text-gray-500 text-center py-4">No pending join requests</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">Join Requests ({pendingRequests.length})</h2>
      
      <div className="space-y-4">
        {pendingRequests.map(request => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={request.user?.image_url || ""} 
                  alt={`${request.user?.first_name || ''} ${request.user?.last_name || ''}`}
                />
                <AvatarFallback>
                  <UserRound className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {request.user?.first_name} {request.user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{request.user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Requested {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {request.message && (
              <>
                <Separator className="my-3" />
                <div className="text-sm bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Message:</p>
                  <p className="text-gray-700">{request.message}</p>
                </div>
              </>
            )}
            
            <Separator className="my-3" />
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleAction(request.id, 'reject')}
                disabled={!!actionInProgress}
              >
                {actionInProgress === request.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction(request.id, 'accept')}
                disabled={!!actionInProgress}
              >
                {actionInProgress === request.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 