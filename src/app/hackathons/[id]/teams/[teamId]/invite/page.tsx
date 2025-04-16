import { Suspense } from 'react';
import { getTeamById, generateTeamInviteLink } from '@/actions/teams';
import { getHackathonById } from '@/actions/hackathon';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyInviteLinkButton } from './_components/CopyInviteLinkButton';
import { Share2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
    teamId: string;
  };
}

export default async function TeamInvitePage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const hackathonId = params.id;
  const teamId = params.teamId;

  const [team, hackathon] = await Promise.all([
    getTeamById(teamId),
    getHackathonById(hackathonId)
  ]);

  if (!team) {
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }

  if (!hackathon) {
    redirect('/hackathons');
  }

  if (team.hackathonId !== hackathonId) {
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }

  // Generate invite link
  const linkResult = await generateTeamInviteLink(teamId, hackathonId);
  const inviteLink = linkResult.success ? linkResult.inviteUrl : null;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Invite Team Members</h1>
        <p className="text-muted-foreground">
          Invite people to join your team for {hackathon.name}
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Invite Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Shareable Invite Link
            </CardTitle>
            <CardDescription>
              Share this link with people you want to invite to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteLink ? (
              <div className="relative">
                <div className="border rounded-md p-3 pr-12 bg-muted text-sm font-mono truncate">
                  {inviteLink}
                </div>
                <CopyInviteLinkButton inviteLink={inviteLink} />
              </div>
            ) : (
              <div className="bg-orange-50 text-orange-800 p-3 rounded-md">
                Unable to generate invite link. Please try again later.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can join your team if they have an account.
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href={`/hackathons/${hackathonId}/dashboard/my-team`}>
            Back to Team
          </Link>
        </Button>
      </div>
    </div>
  );
} 