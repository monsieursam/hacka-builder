'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { inviteTeamMember, addTeamMemberByName } from '@/actions/teams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InviteTeamMemberFormProps {
  hackathonId: string;
  teamId: string;
  availableSpots: number;
}

export default function InviteTeamMemberForm({ 
  hackathonId, 
  teamId, 
  availableSpots
}: InviteTeamMemberFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    
    try {
      const result = await inviteTeamMember({
        teamId,
        hackathonId,
        email
      });
      
      if (result.success) {
        toast.success('Invitation sent successfully');
        setEmail('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('An error occurred while sending the invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddByName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Please enter a name');
      return;
    }

    setLoading(true);
    
    try {
      const result = await addTeamMemberByName({
        teamId,
        hackathonId,
        name
      });
      
      if (result.success) {
        toast.success('Team member added successfully');
        setName('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('An error occurred while adding the team member');
    } finally {
      setLoading(false);
    }
  };

  if (availableSpots <= 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Team is Full</h3>
        <p className="text-gray-600">
          Your team has reached the maximum number of members allowed for this hackathon.
        </p>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="email" className="w-full">
      <TabsList className="w-full mb-6">
        <TabsTrigger value="email" className="flex-1">Invite by Email</TabsTrigger>
        <TabsTrigger value="name" className="flex-1">Add by Name</TabsTrigger>
      </TabsList>
      
      <TabsContent value="email">
        <Card className="p-6">
          <form onSubmit={handleInviteByEmail} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                The person will receive an invitation to join your team.
                They must have an account on the platform.
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/hackathons/${hackathonId}/teams/${teamId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="name">
        <Card className="p-6">
          <form onSubmit={handleAddByName} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                This will add a person to your team without an account. 
                They won't have access to the platform, but will be listed as a team member.
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading || !name}
              >
                {loading ? 'Adding...' : 'Add Member'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/hackathons/${hackathonId}/teams/${teamId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 