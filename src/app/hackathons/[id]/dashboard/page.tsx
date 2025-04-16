import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached, getTeamsByHackathonIdCached, getSubmissionsByHackathonId } from '@/actions/hackathon';
import { getUserTeamWithMembersForHackathon } from '@/actions/teams';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { DashboardTabs } from './_components/DashboardTabs';
import { DeleteHackathonButton } from '@/components/hackathons/DeleteHackathonButton';

// Format date for display
const formatDate = (date: Date) => {
  return date?.toLocaleDateString?.('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function HackathonDashboard({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>
}) {
  const { id: hackathonId } = await params;
  const { userId } = await auth();
  const {error: errorMessage} = await searchParams;
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  // Check if the user is an organizer
  const isOrganizer = userId === hackathon.organizerId;
  
  // Get the user's team for this hackathon if they're a participant
  const userTeam = await getUserTeamWithMembersForHackathon(userId, hackathonId);
  
  // If the user is not an organizer and not on a team, don't redirect anymore,
  // instead allow them to create a team from the dashboard
  
  // Get submissions
  let submissions: any[] = [];
  if (isOrganizer) {
    // Get all hackathon submissions for organizers
    submissions = await getSubmissionsByHackathonId(hackathonId);
  } else if (userTeam) {
    // Get only the team's submission for participants
    submissions = await getSubmissionsByHackathonId(hackathonId, userTeam.id);
  }
  
  // Get all teams if organizer
  const teams = isOrganizer 
    ? await getTeamsByHackathonIdCached(hackathonId) 
    : [];
  
  return (
    <main className="pb-12">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/hackathons">Hackathons</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathon.id}`}>{hackathon.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Error Alert */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{hackathon.name} Dashboard</h1>
              <p className="text-white/80">
                {isOrganizer ? 'Organizer Dashboard' : 'Participant Dashboard'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isOrganizer && (
                <>
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" asChild>
                    <Link href={`/hackathons/${hackathon.id}/edit`}>Edit Hackathon</Link>
                  </Button>
                  <DeleteHackathonButton
                    hackathonId={hackathon.id}
                    hackathonName={hackathon.name}
                    className="bg-red-500/60 hover:bg-red-600/80 border-transparent"
                  />
                </>
              )}
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" asChild>
                <Link href={`/hackathons/${hackathon.id}`}>View Hackathon</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Time Remaining Card */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Time Remaining</h3>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">
                {new Date() > new Date(hackathon.endDate) 
                  ? 'Completed' 
                  : Math.ceil((new Date(hackathon.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ends on {formatDate(new Date(hackathon.endDate))}
            </p>
          </Card>
          
          {/* Submissions Card */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Submissions</h3>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{submissions.length}</p>
              <p className="text-gray-500">{isOrganizer ? 'Total' : ''}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {userTeam && !isOrganizer ? (
                submissions.length ? "Your team has submitted" : "Your team hasn't submitted yet"
              ) : (
                `Submissions ${new Date() > new Date(hackathon.endDate) ? 'received' : 'so far'}`
              )}
            </p>
          </Card>
          
          {/* Teams Card - Only for organizers */}
          {isOrganizer && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Teams</h3>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-gray-500">Registered</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((teams.length / (hackathon.maxParticipants || 100)) * 100)}% of capacity filled
              </p>
            </Card>
          )}
          
          {/* Your Team Card - Only for participants */}
          {!isOrganizer && userTeam && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Your Team</h3>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{userTeam.name}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {userTeam.members} team members
              </p>
            </Card>
          )}
          
          {/* Status Card */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                hackathon.status === 'active' ? 'bg-green-500' : 
                hackathon.status === 'published' ? 'bg-blue-500' :
                hackathon.status === 'completed' ? 'bg-gray-500' :
                'bg-yellow-500'
              }`}></div>
              <p className="text-2xl font-bold capitalize">{hackathon.status}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {hackathon.status === 'active' 
                ? 'Hackathon is ongoing' 
                : hackathon.status === 'published'
                ? 'Registration is open'
                : hackathon.status === 'completed'
                ? 'Hackathon has ended'
                : 'Hackathon is in draft mode'}
            </p>
          </Card>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <DashboardTabs 
            hackathon={hackathon} 
            isOrganizer={isOrganizer} 
            userTeam={userTeam} 
            teams={teams}
            submissions={submissions}
          />
        </div>
      </div>
    </main>
  );
} 