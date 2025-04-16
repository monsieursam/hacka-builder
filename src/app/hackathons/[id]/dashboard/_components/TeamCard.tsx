'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeamDetailsModal } from "./TeamDetailsModal";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    description: string | null;
    hackathonId: string;
    projectName: string | null;
    lookingForMembers: boolean;
    createdAt: Date;
    updatedAt: Date;
    members?: Array<{
      id: string;
      role: string;
      userId: string;
      joinedAt: Date;
      user: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
        image_url: string | null;
      };
    }>;
    submissions?: Array<{
      id: string;
      projectName: string;
      description: string;
      submittedAt: Date;
    }>;
  };
  hackathonId: string;
}

export function TeamCard({ team, hackathonId }: TeamCardProps) {
  const leader = team.members?.find(member => member.role === 'leader');
  const membersCount = team.members?.length || 0;
  
  return (
    <Card className="p-6 w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{team.name}</h3>
          <p className="text-sm text-gray-500">
            {membersCount} member{membersCount !== 1 ? 's' : ''}
          </p>
        </div>
        {team.lookingForMembers && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Recruiting
          </Badge>
        )}
      </div>
      
      {team.description && (
        <p className="text-gray-700 mb-4 line-clamp-2">{team.description}</p>
      )}
      
      {team.projectName && (
        <div className="mb-4">
          <span className="text-sm font-medium">Project: </span>
          <span className="text-sm">{team.projectName}</span>
        </div>
      )}
      
      {leader && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">Team Leader: </span>
          <div className="flex items-center gap-2">
            {leader.user.image_url && (
              <img 
                src={leader.user.image_url} 
                alt={`${leader.user.first_name} ${leader.user.last_name}`}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="text-sm">
              {leader.user.first_name} {leader.user.last_name}
            </span>
          </div>
        </div>
      )}
      
      <Separator className="my-4" />
      
      <div className="flex justify-end">
        <TeamDetailsModal team={team} hackathonId={hackathonId} />
      </div>
    </Card>
  );
} 