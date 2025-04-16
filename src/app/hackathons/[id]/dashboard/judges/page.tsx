import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getJudgesForHackathon } from '@/actions/judges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JudgeList } from '../_components/JudgeList';
import { InviteJudgeForm } from '../_components/InviteJudgeForm';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { UserCheck } from 'lucide-react';

export default async function JudgesPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ error?: string, success?: string }>
}) {
  const { id: hackathonId } = await params;
  const { userId } = await auth();
  const { error, success } = await searchParams;
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  // Check if the user is an organizer
  const isOrganizer = userId === hackathon.organizerId;
  
  // Only organizers can access this page
  if (!isOrganizer) {
    redirect(`/hackathons/${hackathonId}`);
  }
  
  // Get all judges for this hackathon
  const judges = await getJudgesForHackathon(hackathonId);
  
  return (
    <main className="container py-6 space-y-6">

      {/* Notifications */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <UserCheck className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Judge List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Judges</CardTitle>
              <CardDescription>
                {judges.length === 0 
                  ? "No judges have been invited yet" 
                  : `${judges.length} ${judges.length === 1 ? 'judge' : 'judges'} invited`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JudgeList 
                judges={judges} 
                hackathonId={hackathonId} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Invite Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invite a Judge</CardTitle>
              <CardDescription>
                Send an invitation to a registered user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteJudgeForm hackathonId={hackathonId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
