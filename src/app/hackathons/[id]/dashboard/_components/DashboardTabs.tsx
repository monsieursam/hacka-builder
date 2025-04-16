'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Hackathon, Team, Submission, Track, Prize } from '@/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRound, Trophy, Edit, Trash2 } from 'lucide-react';
import { PrizeForm } from './PrizeForm';
import { EditPrizeDialog } from './EditPrizeDialog';
import { toast } from 'sonner';
import { deletePrize } from '@/actions/prizes';

type HackathonWithOrganizer = Hackathon & {
  organizer?: {
    id: string;
    name: string;
    image_url?: string;
  };
  prizes?: Prize[];
};

type TeamWithMemberCount = Team & {
  members: number;
  teamMembers?: Array<{
    id: string;
    userId: string;
    role: string;
    user?: {
      first_name: string;
      last_name: string;
      email: string;
      image_url?: string;
    };
  }>;
};

type SubmissionWithDetails = Submission & {
  team?: {
    id: string;
    name: string;
    hackathonId: string;
  };
  track?: Track;
};

type DashboardTabsProps = {
  hackathon: HackathonWithOrganizer;
  isOrganizer: boolean;
  userTeam?: TeamWithMemberCount;
  teams: TeamWithMemberCount[];
  submissions: SubmissionWithDetails[];
};

export function DashboardTabs({ 
  hackathon, 
  isOrganizer, 
  userTeam, 
  teams,
  submissions
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      {/* Navigation Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          Overview
        </button>
        
        {/* Show submissions tab for both organizers and participants */}
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'submissions'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          {isOrganizer ? 'All Submissions' : 'Your Submission'}
        </button>
        
        {/* Teams tab only for organizers */}
        {isOrganizer && (
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'teams'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Teams
          </button>
        )}
        
        {/* Prizes tab only for organizers */}
        {isOrganizer && (
          <button
            onClick={() => setActiveTab('prizes')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'prizes'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Prizes
          </button>
        )}
        
        {/* My Team tab only for participants */}
        {!isOrganizer && userTeam && (
          <button
            onClick={() => setActiveTab('myteam')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'myteam'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            My Team
          </button>
        )}
        
        {/* Resources tab for both */}
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'resources'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          Resources
        </button>
        
        {/* Announcements tab (could be implemented later with actual data) */}
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'announcements'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          Announcements
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            
            {/* Show team creation section for participants without a team */}
            {!isOrganizer && !userTeam && (
              <div className="mb-8 p-6 border border-purple-200 bg-purple-50 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Create Your Team</h3>
                <p className="mb-4">Start by creating your team to participate in this hackathon.</p>
                <Button asChild>
                  <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="md:col-span-2 space-y-6">
                {/* Key Dates */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Key Dates</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-4">
                      <div className="w-1 bg-purple-600 rounded-full"></div>
                      <div>
                        <p className="font-semibold">Start Date</p>
                        <p className="text-gray-600">
                          {new Date(hackathon.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-1 bg-purple-600 rounded-full"></div>
                      <div>
                        <p className="font-semibold">Submission Deadline</p>
                        <p className="text-gray-600">
                          {new Date(hackathon.endDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>
                
                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isOrganizer ? (
                      <>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/edit`}>Edit Hackathon</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/announcements/new`}>Create Announcement</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/teams`}>View Teams</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/judges`}>Manage Judges</Link>
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('prizes')}>
                          Manage Prizes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/dashboard/submit`}>Submit Project</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/teams/${userTeam?.id}`}>Manage Team</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/resources`}>View Resources</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/hackathons/${hackathon.id}/contact`}>Contact Organizers</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </div>
              
              {/* Side Content */}
              <div className="space-y-6">
                {/* Upcoming Deadlines */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Upcoming Deadlines</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <span className="font-medium">Submission Deadline</span>
                      <span className="text-sm text-gray-600">
                        {new Date(hackathon.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </li>
                  </ul>
                </Card>
                
                {/* Resources */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href={`/hackathons/${hackathon.id}`} className="text-purple-600 hover:underline">
                        Hackathon Overview
                      </Link>
                    </li>
                    {userTeam && !isOrganizer && (
                      <li>
                        <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}`} className="text-purple-600 hover:underline">
                          Your Team Profile
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link href={`/hackathons/${hackathon.id}/rules`} className="text-purple-600 hover:underline">
                        Rules & Guidelines
                      </Link>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isOrganizer ? 'Hackathon Submissions' : 'Your Submission'}</h2>
            </div>
            
            {/* Display submissions based on role */}
            {isOrganizer ? (
              submissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{submission.projectName}</h3>
                          <p className="text-sm text-gray-500">
                            Submitted by Team: {submission.team?.name || 'Unknown Team'}
                          </p>
                        </div>
                        {submission.trackId && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {submission.track?.name || 'Track'}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3">{submission.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {submission.repoUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              GitHub Repository
                            </a>
                          </div>
                        )}
                        
                        {submission.demoUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z"/>
                            </svg>
                            <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Live Demo
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-end">
                        <Link href={`/hackathons/${hackathon.id}/submissions/${submission.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">No submissions yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    No teams have submitted projects for this hackathon yet
                  </p>
                </div>
              )
            ) : (
              // Participant view of their submission
              <>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <Card key={submission.id} className="p-6 mb-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold">{submission.projectName}</h3>
                          <p className="text-sm text-gray-500">
                            Submitted on {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/hackathons/${hackathon.id}/dashboard/submit?edit=true`}>
                            Edit Submission
                          </Link>
                        </Button>
                      </div>
                      
                      <Separator className="mb-6" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold mb-2">Project Description</h4>
                          <p className="text-gray-700 whitespace-pre-line mb-6">{submission.description}</p>
                          
                          {submission.trackId && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-2">Track</h4>
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                {submission.track?.name || 'Track'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Project Links</h4>
                          <ul className="space-y-4">
                            {submission.repoUrl && (
                              <li>
                                <h5 className="text-sm text-gray-500">GitHub Repository</h5>
                                <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                  {submission.repoUrl}
                                </a>
                              </li>
                            )}
                            
                            {submission.demoUrl && (
                              <li>
                                <h5 className="text-sm text-gray-500">Demo URL</h5>
                                <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {submission.demoUrl}
                                </a>
                              </li>
                            )}
                            
                            {submission.presentationUrl && (
                              <li>
                                <h5 className="text-sm text-gray-500">Presentation</h5>
                                <a href={submission.presentationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {submission.presentationUrl}
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="mb-6">
                    <Card className="p-6">
                      <h3 className="text-xl font-bold mb-4">Submit Your Project</h3>
                      <p className="text-gray-600 mb-6">
                        Share your team's work for this hackathon. You'll need to provide:
                      </p>
                      <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-600">
                        <li>Project name and description</li>
                        <li>GitHub repository link (required)</li>
                        <li>Demo URL (optional)</li>
                        <li>Presentation link (optional)</li>
                      </ul>
                      <Button asChild>
                        <Link href={`/hackathons/${hackathon.id}/dashboard/submit`}>
                          Create Submission
                        </Link>
                      </Button>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Teams Tab (Organizers Only) */}
        {activeTab === 'teams' && isOrganizer && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Registered Teams</h2>
            
            {teams.length > 0 ? (
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
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/hackathons/${hackathon.id}/teams/${team.id}`}>
                        View Team
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-600">No teams yet</h3>
                <p className="text-gray-500">No teams have registered for this hackathon yet</p>
              </div>
            )}
          </div>
        )}

        {/* My Team Tab - Only for participants */}
        {activeTab === 'myteam' && userTeam && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Team</h2>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}/edit`}>
                    Edit Team
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}/invite`}>
                    Invite Members
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Details */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Team Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Team Name</p>
                      <p className="font-medium">{userTeam.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p>{userTeam.description || "No description provided."}</p>
                    </div>
                    
                    {userTeam.projectName && (
                      <div>
                        <p className="text-sm text-gray-500">Project Name</p>
                        <p className="font-medium">{userTeam.projectName}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Looking for Members</p>
                      <p className="font-medium">{userTeam.lookingForMembers ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Team Members Section */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Team Members</h3>
                    <p className="text-sm text-gray-500">{userTeam.members}/{hackathon.maxTeamSize} members</p>
                  </div>
                  
                  {userTeam.teamMembers && userTeam.teamMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userTeam.teamMembers.map(member => (
                        <Card key={member.id} className="p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={member.user?.image_url} 
                              alt={`${member.user?.first_name || ''} ${member.user?.last_name || ''}`} 
                            />
                            <AvatarFallback>
                              <UserRound className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user?.first_name} {member.user?.last_name}
                              {member.role === 'owner' && 
                                <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                                  Owner
                                </span>
                              }
                            </p>
                            <p className="text-sm text-gray-500">{member.user?.email}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No team members found</p>
                    </div>
                  )}
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Team Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/hackathons/${hackathon.id}/teams/${userTeam.id}/invite`}>
                        <UserRound className="mr-2 h-4 w-4" />
                        Invite Team Members
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/hackathons/${hackathon.id}/dashboard/submit`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Submit Project
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Hackathon Resources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Documentation</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Hackathon Rules
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Submission Guidelines
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Judging Criteria
                    </a>
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Useful Links</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Discord Community
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Schedule
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      FAQ
                    </a>
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Technical Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      API Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Boilerplate Code
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Development Tools
                    </a>
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Organizers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Find Teammates
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-purple-600 hover:underline flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help & FAQ
                    </a>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Announcements</h2>
              {isOrganizer && (
                <Button asChild>
                  <Link href={`/hackathons/${hackathon.id}/announcements/new`}>Create Announcement</Link>
                </Button>
              )}
            </div>
            
            {/* Just placeholder announcements for now - would be replaced with real data */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold">Welcome to the Hackathon!</h3>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Welcome to all participants! We're excited to have you join us for this hackathon. 
                  Be sure to check out the resources section for important information.
                </p>
                <div className="text-sm text-gray-500">
                  Posted by Organizer
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold">Workshops Schedule Updated</h3>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <p className="text-gray-700 mb-4">
                  We've updated the schedule for workshops. Please check the resources section for the latest schedule.
                </p>
                <div className="text-sm text-gray-500">
                  Posted by Organizer
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Prizes Tab */}
        {activeTab === 'prizes' && isOrganizer && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Prizes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Prize List Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Existing Prizes</h3>
                
                {hackathon.prizes && hackathon.prizes.length > 0 ? (
                  <div className="space-y-4">
                    {hackathon.prizes.map((prize) => (
                      <Card key={prize.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                              <Trophy size={20} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{prize.name}</h4>
                              <p className="text-sm text-gray-600">{prize.description}</p>
                              {prize.value && (
                                <p className="text-sm font-medium">
                                  {prize.value} {prize.currency || 'USD'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <EditPrizeDialog prize={prize} hackathonId={hackathon.id} />
                            <button 
                              onClick={async () => {
                                if (confirm("Are you sure you want to delete this prize?")) {
                                  const result = await deletePrize(prize.id);
                                  if (result.success) {
                                    toast.success("Prize deleted successfully");
                                  } else {
                                    toast.error(result.error || "Failed to delete prize");
                                  }
                                }
                              }}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No prizes created yet</h3>
                    <p className="text-gray-500 mb-2">Add your first prize to motivate participants</p>
                  </div>
                )}
              </div>
              
              {/* Add Prize Form */}
              <div>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Add a New Prize</h3>
                  <PrizeForm hackathonId={hackathon.id} />
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 