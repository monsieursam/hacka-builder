'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { removeTeam } from '@/actions/teams';

type Team = {
  id: string;
  name: string;
  description: string | null;
  projectName: string | null;
  members: number;
  lookingForMembers: boolean;
};

interface TeamsTableProps {
  teams: Team[];
  hackathonId: string;
  isOrganizer: boolean;
}

export default function TeamsTable({ teams, hackathonId, isOrganizer }: TeamsTableProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [teamToRemove, setTeamToRemove] = useState<string | null>(null);

  const handleRemoveTeam = async () => {
    if (!teamToRemove) return;
    
    setIsLoading(true);
    
    try {
      const result = await removeTeam(teamToRemove, hackathonId);
      
      if (result.success) {
        toast.success('Team removed successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to remove team');
      }
    } catch (error) {
      toast.error('An error occurred while removing the team');
      console.error(error);
    } finally {
      setIsLoading(false);
      setTeamToRemove(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <Card key={team.id} className="p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">{team.name}</h3>
            {team.projectName && (
              <p className="text-sm font-medium text-purple-600 mb-2">Project: {team.projectName}</p>
            )}
            <p className="text-gray-600 mb-4">{team.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-gray-600">{team.members} members</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${team.lookingForMembers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {team.lookingForMembers ? 'Recruiting' : 'Team Full'}
              </span>
            </div>
            <Separator className="my-4" />
            <div className="flex gap-2">
              <Button variant="default" className={isOrganizer ? "w-2/3" : "w-full"} size="sm" asChild>
                <Link href={`/hackathons/${hackathonId}/teams/${team.id}`}>
                  View Details
                </Link>
              </Button>
              
              {isOrganizer && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-1/3"
                  onClick={() => setTeamToRemove(team.id)}
                >
                  Remove
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!teamToRemove} onOpenChange={() => setTeamToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action will permanently delete the team, its members, and all associated submissions.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamToRemove(null)} disabled={isLoading}>Cancel</Button>
            <Button 
              onClick={handleRemoveTeam}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Removing...' : 'Remove Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 