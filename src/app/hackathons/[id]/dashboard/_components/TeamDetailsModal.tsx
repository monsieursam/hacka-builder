'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TeamDetailsModalProps {
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

export function TeamDetailsModal({
  team,
  hackathonId,
}: TeamDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Team</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{team.name}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-600">
              {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
            </p>
            {team.lookingForMembers && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Recruiting
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            {team.description && (
              <>
                <h3 className="font-semibold mb-2">Team Description</h3>
                <p className="text-sm whitespace-pre-line mb-4">{team.description}</p>
                <Separator className="my-4" />
              </>
            )}
            
            <h3 className="font-semibold mb-2">Team Members</h3>
            <div className="space-y-3">
              {team.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  {member.user.image_url && (
                    <img 
                      src={member.user.image_url} 
                      alt={`${member.user.first_name} ${member.user.last_name}`}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {member.user.first_name} {member.user.last_name}
                      {member.role === 'leader' && (
                        <span className="ml-2 text-xs text-gray-500">(Team Leader)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {team.submissions && team.submissions.length > 0 && (
              <>
                <Separator className="my-4" />
                <h3 className="font-semibold mb-2">Submissions</h3>
                <div className="space-y-3">
                  {team.submissions.map((submission) => (
                    <div key={submission.id} className="border p-3 rounded-md">
                      <p className="font-medium text-sm">{submission.projectName}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm line-clamp-2">{submission.description}</p>
                      <div className="mt-2">
                        <Link 
                          href={`/hackathons/${hackathonId}/dashboard/submissions?teamId=${team.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View submission details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Team Info</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Created on</h4>
                  <p className="text-sm">{new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
                
                {team.projectName && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Project</h4>
                    <p className="text-sm">{team.projectName}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Status</h4>
                  <p className="text-sm">
                    {team.lookingForMembers ? 'Looking for members' : 'Not recruiting'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button size="sm" asChild>
                <Link href={`/hackathons/${hackathonId}/dashboard/teams/${team.id}`}>
                  View Full Page
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 