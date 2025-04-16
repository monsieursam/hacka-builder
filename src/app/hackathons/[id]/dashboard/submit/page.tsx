import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getUserTeamForHackathon } from '@/actions/teams';
import { getTracksByHackathonId } from '@/actions/hackathon';
import { getSubmissionsByHackathonId } from '@/actions/hackathon';
import { redirect, notFound } from 'next/navigation';
import { Submission } from '@/db/schema';
import SubmissionForm from '@/components/hackathons/SubmissionForm';
import SubmissionEditForm from '@/components/hackathons/SubmissionEditForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default async function SubmitProjectPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>
}) {
  const { userId } = await auth();
  const {id} = await params;
  const {edit} = await searchParams;
  const isEdit = edit === 'true';
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathon info
  const hackathon = await getHackathonByIdCached(id);
  
  if (!hackathon) {
    notFound();
  }
  
  // Check if hackathon is accepting submissions
  if (hackathon.status !== 'active') {
    redirect(`/hackathons/${id}/dashboard?error=Hackathon is not active for submissions`);
  }
  
  // Get user's team
  const team = await getUserTeamForHackathon(userId, id);
  
  if (!team) {
    redirect(`/hackathons/${id}/teams/new?error=You must join or create a team before submitting`);
  }
  
  // Get tracks for this hackathon
  const tracks = await getTracksByHackathonId(id);
  
  // If editing, get existing submission
  let existingSubmission: Submission | undefined;
  
  if (isEdit) {
    const submissions = await getSubmissionsByHackathonId(id, team.id);
    if (submissions.length === 0) {
      redirect(`/hackathons/${id}/dashboard/submit`);
    }
    existingSubmission = submissions[0] as Submission;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
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
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathon.id}/dashboard`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isEdit ? 'Edit Submission' : 'Submit Project'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{isEdit ? 'Edit Your Submission' : 'Submit Your Project'}</h1>
      <p className="text-gray-600 mb-6">
        {isEdit ? 'Update your project details for' : 'Share your hackathon project for'} {hackathon.name}
      </p>
      
      {isEdit && existingSubmission ? (
        <SubmissionEditForm
          hackathonId={id}
          submissionId={existingSubmission.id}
          initialData={{
            projectName: existingSubmission.projectName,
            description: existingSubmission.description,
            repoUrl: existingSubmission.repoUrl || '',
            demoUrl: existingSubmission.demoUrl || '',
            presentationUrl: existingSubmission.presentationUrl || '',
            trackId: existingSubmission.trackId || undefined,
          }}
          teamName={team.name}
          tracks={tracks}
        />
      ) : (
        <SubmissionForm 
          hackathonId={id} 
          teamId={team.id}
          teamName={team.name}
          tracks={tracks}
        />
      )}
    </div>
  );
} 