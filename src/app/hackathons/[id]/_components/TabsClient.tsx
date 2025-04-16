'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Track, Hackathon, Team } from '@/db/schema';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Define the types used in the component
type HackathonWithOrganizer = Hackathon & {
  organizer?: {
    id: string;
    name: string;
    image_url?: string;
  };
  prizes?: Array<{
    id: string;
    name: string;
    description?: string;
    value?: number;
    currency?: string;
    rank?: number;
  }>;
};

type TeamWithMemberCount = Team & {
  members: number;
};

type TabsClientProps = {
  hackathon: HackathonWithOrganizer;
  teams: TeamWithMemberCount[];
  tracks: Track[];
};

export function TabsClient({ hackathon, teams, tracks }: TabsClientProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Navigation Tabs */}
      <TabsList className="w-full overflow-x-auto mb-8 border-b bg-transparent h-auto p-0 rounded-none">
        <TabsTrigger 
          value="overview"
          className="rounded-none border-0 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-600 hover:text-purple-600"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="teams"
          className="rounded-none border-0 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-600 hover:text-purple-600"
        >
          Teams
        </TabsTrigger>
        <TabsTrigger 
          value="tracks"
          className="rounded-none border-0 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-600 hover:text-purple-600"
        >
          Tracks
        </TabsTrigger>
        <TabsTrigger 
          value="prizes"
          className="rounded-none border-0 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-600 hover:text-purple-600"
        >
          Prizes
        </TabsTrigger>
        <TabsTrigger 
          value="resources"
          className="rounded-none border-0 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-600 hover:text-purple-600"
        >
          Resources
        </TabsTrigger>
        <TabsTrigger 
          value="rules"
          className="rounded-none border-0 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-600 hover:text-purple-600"
        >
          Rules
        </TabsTrigger>
      </TabsList>

      {/* Tab Content */}
      <div className="mb-8">
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">About the Hackathon</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{hackathon.description}</p>
              
              {hackathon.theme && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Theme</h3>
                  <p className="text-gray-700">{hackathon.theme}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Organized by</h3>
                {hackathon.organizer && (
                  <div className="flex items-center">
                    {hackathon.organizer.image_url && (
                      <img 
                        src={hackathon.organizer.image_url} 
                        alt={hackathon.organizer.name} 
                        className="w-12 h-12 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{hackathon.organizer.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Hackathon Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">Dates</p>
                      <p className="text-gray-600">{formatDate(new Date(hackathon.startDate))} - {formatDate(new Date(hackathon.endDate))}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{hackathon.isVirtual ? 'Virtual Event' : hackathon.location}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Team Size</p>
                      <p className="text-gray-600">{hackathon.minTeamSize} - {hackathon.maxTeamSize} members</p>
                    </div>
                  </li>
                  {hackathon.maxParticipants && (
                    <li className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-gray-600">Maximum of {hackathon.maxParticipants} participants</p>
                      </div>
                    </li>
                  )}
                  {hackathon.maxTeams && (
                    <li className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div>
                        <p className="font-medium">Team Limit</p>
                        <p className="text-gray-600">Maximum of {hackathon.maxTeams} teams</p>
                      </div>
                    </li>
                  )}
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Participating Teams</h2>
                {hackathon.maxTeams && (
                  <p className="text-gray-600 mt-1">
                    {teams.length} of {hackathon.maxTeams} teams registered
                  </p>
                )}
              </div>
            </div>
            
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
                    <div className="flex gap-2">
                      <Button variant="outline" className="w-full" size="sm" asChild>
                        <Link href={`/hackathons/${hackathon.id}/teams/${team.id}`}>
                          View Team
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-600 mb-2">No teams yet</h3>
                <p className="text-gray-500 mb-6">Be the first to create a team for this hackathon</p>
                <Button asChild>
                  <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tracks">
          <div>
            <h2 className="text-2xl font-bold mb-6">Hackathon Tracks</h2>
            
            {tracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tracks.map(track => (
                  <Card key={track.id} className="p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold mb-3">{track.name}</h3>
                    <p className="text-gray-600">{track.description}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-600">No tracks specified</h3>
                <p className="text-gray-500">This hackathon doesn't have any specific tracks</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prizes">
          <div>
            <h2 className="text-2xl font-bold mb-6">Prizes & Rewards</h2>
            
            {hackathon.prizes && hackathon.prizes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hackathon.prizes.map((prize, index: number) => (
                  <Card key={prize.id || index} className="p-6 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl mb-4">
                        {prize.rank || index + 1}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{prize.name}</h3>
                      <p className="text-gray-600">{prize.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-600">No prizes specified</h3>
                <p className="text-gray-500">Prize information will be announced soon</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources">
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
        </TabsContent>

        <TabsContent value="rules">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Hackathon Rules</h2>
              <Link href={`/hackathons/${hackathon.id}/rules`}>
                <Button>
                  {hackathon.rules ? 'Edit Rules' : 'Create Rules'}
                </Button>
              </Link>
            </div>
            
            <Card className="p-6">
              {hackathon.rules ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: hackathon.rules.replace(/\n/g, '<br />') }} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No rules defined yet</h3>
                  <p className="text-gray-500 mb-6">
                    Define the rules and guidelines for participants to follow during the hackathon.
                  </p>
                  <Link href={`/hackathons/${hackathon.id}/rules`}>
                    <Button>Create Rules</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
} 