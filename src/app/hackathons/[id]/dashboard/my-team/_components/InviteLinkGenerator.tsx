import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { generateTeamInviteLink } from "@/actions/teams";
import { InviteLinkDisplay } from "./InviteLinkDisplay";

interface InviteLinkGeneratorProps {
  teamId: string;
  hackathonId: string | null | undefined;
}

export async function InviteLinkGenerator({ teamId, hackathonId }: InviteLinkGeneratorProps) {
  // Make sure we have valid IDs
  if (!teamId || !hackathonId) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Team Invite Link
          </CardTitle>
          <CardDescription>
            Share this link to let people join your team directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            Missing team or hackathon ID
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate the invite link on the server
  const result = await generateTeamInviteLink(
    teamId.toString(), 
    hackathonId.toString()
  );
  
  const inviteLink = result.success ? result.inviteUrl : null;
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Team Invite Link
        </CardTitle>
        <CardDescription>
          Share this link to let people join your team directly
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result.success ? (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {result.error || "Failed to generate invite link"}
          </div>
        ) : (
          <InviteLinkDisplay inviteLink={inviteLink || ""} />
        )}
      </CardContent>
    </Card>
  );
} 