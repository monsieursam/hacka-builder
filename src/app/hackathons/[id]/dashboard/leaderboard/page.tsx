import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRound, Trophy, Medal } from 'lucide-react';
import { getTeamRankingsForHackathon } from '@/actions/reviews';
import { getTracksForHackathon } from '@/actions/tracks';
import { PublishLeaderboardButton } from './_components/PublishLeaderboardButton';

interface TeamRanking {
  id: string;
  name: string;
  score: number;
  rank: number;
  memberCount: number;
  projectName: string;
  leader: {
    name: string;
    image: string | null;
  } | null;
  reviewCount: number;
  trackId?: string | null;
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center bg-yellow-500 w-8 h-8 rounded-full text-white">
        <Trophy className="w-4 h-4" />
      </div>
    );
  }
  
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center bg-gray-400 w-8 h-8 rounded-full text-white">
        <Medal className="w-4 h-4" />
      </div>
    );
  }
  
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center bg-amber-700 w-8 h-8 rounded-full text-white">
        <Medal className="w-4 h-4" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center bg-gray-200 w-8 h-8 rounded-full text-gray-700 font-bold">
      {rank}
    </div>
  );
}

function TeamCard({ team, tracks }: { 
  team: TeamRanking, 
  tracks?: { id: string, name: string }[] 
}) {
  // Find track name if trackId exists
  const trackName = team.trackId && tracks ? 
    tracks.find(t => t.id === team.trackId)?.name : 
    null;

  return (
    <Card key={team.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {getRankBadge(team.rank)}
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              {trackName && (
                <span className="text-xs text-gray-500">
                  Track: {trackName}
                </span>
              )}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Score: {team.score} {team.reviewCount > 0 && `(${team.reviewCount} reviews)`}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-2">
            {team.projectName}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            {team.leader && (
              <div className="flex items-center gap-2 mr-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={team.leader.image || ""} alt={team.leader.name} />
                  <AvatarFallback>
                    <UserRound className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span>{team.leader.name}</span>
              </div>
            )}
            <div>
              {team.memberCount} team member{team.memberCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default async function LeaderboardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: hackathonId } = await params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  const isOrganizer = hackathon.organizerId === userId;
  const canViewLeaderboard = hackathon.leaderboardPublished || isOrganizer;
  
  if (!canViewLeaderboard) {
    return (
      <div className="py-8 px-6">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Leaderboard Not Available</h3>
          <p className="text-gray-500 mb-1">The leaderboard for this hackathon has not been published yet.</p>
          <p className="text-gray-500 text-sm">Check back later when the organizer publishes the results.</p>
        </div>
      </div>
    );
  }
  
  // Fetch real team rankings from the database
  const teams = await getTeamRankingsForHackathon(hackathonId);
  
  // Fetch tracks for the hackathon
  const tracks = await getTracksForHackathon(hackathonId);

  // Group teams by tracks (this example assumes teams are already associated with tracks)
  const teamsWithNoTrack = teams.filter(team => !team.trackId);
  const teamsByTrack = tracks.reduce((acc, track) => {
    acc[track.id] = teams.filter(team => team.trackId === track.id);
    return acc;
  }, {} as Record<string, TeamRanking[]>);

  return (
    <div className="py-8 px-6">
      {isOrganizer && !hackathon.leaderboardPublished && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <p className="text-amber-800 font-medium">
              This leaderboard is only visible to you as an organizer. Publish it when you're ready for all participants to see it.
            </p>
            <PublishLeaderboardButton 
              hackathonId={hackathonId} 
              isPublished={hackathon.leaderboardPublished} 
            />
          </div>
        </div>
      )}
      
      {isOrganizer && hackathon.leaderboardPublished && (
        <div className="flex justify-end mb-4">
          <PublishLeaderboardButton 
            hackathonId={hackathonId}
            isPublished={hackathon.leaderboardPublished}
          />
        </div>
      )}
      
      <p className="text-gray-600 mb-6">
        Teams are ranked based on average scores from judges across all criteria.
      </p>
      
      <Tabs defaultValue="overall" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          {tracks.map(track => (
            <TabsTrigger key={track.id} value={track.id}>
              {track.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="overall">
          {teams.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">No team rankings available yet.</p>
              <p className="text-gray-500 text-sm">Rankings will appear once judges begin submitting reviews.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} tracks={tracks} />
              ))}
            </div>
          )}
        </TabsContent>
        
        {tracks.map(track => (
          <TabsContent key={track.id} value={track.id}>
            {!teamsByTrack[track.id] || teamsByTrack[track.id].length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-2">No teams in this track yet.</p>
                <p className="text-gray-500 text-sm">Teams will appear here once they submit projects in the {track.name} track.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 mt-4">
                {teamsByTrack[track.id].map((team) => (
                  <TeamCard key={team.id} team={team} tracks={tracks} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="bg-gray-50 p-4 rounded-lg border mt-8">
        <h3 className="font-medium mb-2">About the Leaderboard</h3>
        <p className="text-sm text-gray-600">
          Rankings are updated as judges submit their evaluations. Final rankings will be announced at the end of the hackathon.
          Teams are scored on innovation, technical execution, impact, and presentation quality.
          You can view rankings by specific tracks using the tabs above.
        </p>
      </div>
    </div>
  );
} 