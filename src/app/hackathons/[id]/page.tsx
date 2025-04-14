'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';

// Temporary type definitions until we connect to real data
type Hackathon = {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  registrationStatus: string;
  location?: string;
  isVirtual: boolean;
  maxTeamSize: number;
  minTeamSize: number;
  maxParticipants?: number;
  banner?: string;
  logo?: string;
  theme?: string;
  prizes: any[];
  rules?: string;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    avatar?: string;
  };
};

type Team = {
  id: string;
  name: string;
  description?: string;
  members: number;
  lookingForMembers: boolean;
  projectName?: string;
};

type Track = {
  id: string;
  name: string;
  description?: string;
};

export default function HackathonPage({ params }: { params: { id: string } }) {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchHackathonData() {
      try {
        // In production, this would fetch from the database
        // const result = await db.query.hackathons.findFirst({
        //   where: eq(hackathons.id, params.id)
        // });

        // For now, using mock data based on the ID
        if (params.id === '1') {
          const mockHackathon: Hackathon = {
            id: '1',
            name: 'AI for Good Hackathon',
            description: 'Build solutions that leverage AI to address social and environmental challenges. This hackathon aims to bring together developers, designers, and subject matter experts to create innovative applications that can help solve pressing global issues using artificial intelligence and machine learning technologies.',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),   // 9 days from now
            status: 'active',
            registrationStatus: 'open',
            isVirtual: true,
            maxTeamSize: 5,
            minTeamSize: 2,
            maxParticipants: 200,
            banner: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070',
            logo: 'https://images.unsplash.com/photo-1518723185877-9a504cc2503b?q=80&w=1964',
            theme: 'Using AI to solve global challenges',
            prizes: [
              { 
                place: '1st', 
                name: 'Grand Prize', 
                description: '$10,000 cash + cloud credits + mentorship',
              },
              { 
                place: '2nd', 
                name: 'Runner Up', 
                description: '$5,000 cash + cloud credits',
              },
              { 
                place: '3rd', 
                name: 'Third Place', 
                description: '$2,500 cash + cloud credits',
              },
            ],
            rules: 'All participants must adhere to ethical AI principles. Projects must be original work created during the hackathon. Teams must consist of 2-5 members. All code must be open source and submitted to the hackathon repository.',
            organizerId: 'org1',
            organizer: {
              id: 'org1',
              name: 'Tech For Good Foundation',
              avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974',
            },
          };

          const mockTeams: Team[] = [
            {
              id: 't1',
              name: 'AI Guardians',
              description: 'Building ethical AI solutions for environmental protection',
              members: 3,
              lookingForMembers: true,
            },
            {
              id: 't2',
              name: 'Neural Network Ninjas',
              description: 'Developing accessible AI tools for education',
              members: 4,
              lookingForMembers: true,
            },
            {
              id: 't3',
              name: 'Machine Learning Masters',
              description: 'Creating healthcare solutions with AI',
              members: 5,
              lookingForMembers: false,
              projectName: 'MedAssist AI',
            },
          ];

          const mockTracks: Track[] = [
            {
              id: 'tr1',
              name: 'Climate Action',
              description: 'AI solutions addressing climate change and environmental sustainability',
            },
            {
              id: 'tr2',
              name: 'Education',
              description: 'AI applications to improve access to quality education',
            },
            {
              id: 'tr3',
              name: 'Healthcare',
              description: 'AI tools to enhance healthcare accessibility and quality',
            },
          ];

          setHackathon(mockHackathon);
          setTeams(mockTeams);
          setTracks(mockTracks);
        } else {
          // If hackathon doesn't exist, return 404
          notFound();
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch hackathon data:', error);
        setIsLoading(false);
      }
    }

    fetchHackathonData();
  }, [params.id]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'published':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-purple-500';
    }
  };

  // Get registration status badge color
  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'invitation_only':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading hackathon details...</div>
      </div>
    );
  }

  if (!hackathon) {
    return notFound();
  }

  return (
    <main className="pb-12">
      {/* Hero Banner */}
      <div className="relative h-80 w-full">
        {hackathon.banner ? (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${hackathon.banner})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white text-center">
          {hackathon.logo && (
            <img src={hackathon.logo} alt={hackathon.name} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-white" />
          )}
          <h1 className="text-4xl font-bold mb-4">{hackathon.name}</h1>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <span className={`px-3 py-1 ${getStatusColor(hackathon.status)} rounded-full text-sm uppercase`}>
              {hackathon.status}
            </span>
            <span className={`px-3 py-1 ${getRegistrationStatusColor(hackathon.registrationStatus)} rounded-full text-sm uppercase`}>
              Registration {hackathon.registrationStatus}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {hackathon.isVirtual ? 'Virtual' : hackathon.location}
            </span>
          </div>
          <p className="text-lg max-w-3xl">
            {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-end">
          {hackathon.registrationStatus === 'open' && (
            <Button size="lg" asChild>
              <Link href={`/hackathons/${hackathon.id}/register`}>Register Now</Link>
            </Button>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/hackathons/${hackathon.id}/teams`}>Browse Teams</Link>
          </Button>
        </div>

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
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'tracks'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Tracks
          </button>
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
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'rules'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Rules
          </button>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && (
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
                      {hackathon.organizer.avatar && (
                        <img 
                          src={hackathon.organizer.avatar} 
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
                        <p className="text-gray-600">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</p>
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
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Participating Teams</h2>
                <Button asChild>
                  <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
                </Button>
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
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No teams yet</h3>
                  <p className="text-gray-500 mb-6">Be the first to create a team for this hackathon</p>
                  <Button asChild>
                    <Link href={`/hackathons/${hackathon.id}/teams/new`}>Create Team</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracks' && (
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
          )}

          {activeTab === 'prizes' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Prizes & Rewards</h2>
              
              {hackathon.prizes && hackathon.prizes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hackathon.prizes.map((prize, index) => (
                    <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl mb-4">
                          {prize.place}
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
          )}

          {activeTab === 'rules' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Hackathon Rules</h2>
              
              {hackathon.rules ? (
                <div className="prose prose-purple max-w-none">
                  <p className="whitespace-pre-line">{hackathon.rules}</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-medium text-gray-600">No rules specified</h3>
                  <p className="text-gray-500">Rules information will be announced soon</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 