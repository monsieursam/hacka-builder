import { Suspense } from 'react';
import { getTeamById, joinTeamViaInviteLink } from '@/actions/teams';
import { getHackathonById } from '@/actions/hackathon';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import JoinTeamForm from './_components/JoinTeamForm';

interface PageProps {
  params: {
    teamId: string;
  };
  searchParams: {
    hackathonId?: string;
  };
}

export default async function TeamInvitePage({ params, searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const teamId = params.teamId;
  const hackathonId = searchParams.hackathonId;

  if (!hackathonId) {
    redirect('/hackathons');
  }

  const [team, hackathon] = await Promise.all([
    getTeamById(teamId),
    getHackathonById(hackathonId)
  ]);

  if (!team) {
    redirect(`/hackathons/${hackathonId}`);
  }

  if (!hackathon) {
    redirect('/hackathons');
  }

  if (team.hackathonId !== hackathonId) {
    redirect(`/hackathons/${hackathonId}`);
  }

  return (
    <div className="container max-w-lg py-12">
      <Card className="border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Team</CardTitle>
          <CardDescription>
            You've been invited to join {team.name} for {hackathon.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 bg-muted">
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Team Name</h3>
                <p className="font-medium">{team.name}</p>
              </div>
              
              {team.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p>{team.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Hackathon</h3>
                <p>{hackathon.name}</p>
              </div>
            </div>
          </div>
          
          <Suspense fallback={<div>Loading...</div>}>
            <JoinTeamForm teamId={teamId} hackathonId={hackathonId} />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <Link href="/hackathons">
              View all hackathons
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 