'use client';

import { useState } from 'react';
import { Judge, User } from '@/db/schema';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { inviteJudge, removeJudge } from '@/actions/judges';

type JudgeWithUser = Judge & {
  user: User;
};

interface JudgesManagementProps {
  hackathonId: string;
  initialJudges: JudgeWithUser[];
}

export default function JudgesManagement({ hackathonId, initialJudges }: JudgesManagementProps) {
  const router = useRouter();
  const [judges, setJudges] = useState<JudgeWithUser[]>(initialJudges);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await inviteJudge({
        hackathonId,
        email,
      });
      
      if (result.success) {
        toast.success('Judge invitation sent');
        if (result.judge) {
          setJudges([...judges, result.judge]);
        }
        setEmail('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to invite judge');
      }
    } catch (error) {
      toast.error('An error occurred while inviting judge');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveJudge = async (judgeId: string) => {
    if (!confirm('Are you sure you want to remove this judge?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await removeJudge({
        judgeId,
        hackathonId,
      });
      
      if (result.success) {
        toast.success('Judge removed successfully');
        setJudges(judges.filter(judge => judge.id !== judgeId));
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to remove judge');
      }
    } catch (error) {
      toast.error('An error occurred while removing judge');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Invite a Judge</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteJudge} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="judge@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Judges</CardTitle>
        </CardHeader>
        <CardContent>
          {judges.length > 0 ? (
            <div className="space-y-4">
              {judges.map((judge) => (
                <div 
                  key={judge.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{judge.user.name || `${judge.user.first_name || ''} ${judge.user.last_name || ''}`}</div>
                    <div className="text-sm text-gray-500">{judge.user.email}</div>
                    <div className="text-xs mt-1">
                      {judge.isAccepted 
                        ? <span className="text-green-600">Accepted</span> 
                        : <span className="text-yellow-600">Pending</span>}
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveJudge(judge.id)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No judges have been invited yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 