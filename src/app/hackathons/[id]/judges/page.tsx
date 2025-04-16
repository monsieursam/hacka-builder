import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { eq, and } from 'drizzle-orm';
import { hackathons, judges, users } from '@/db/schema';
import JudgesManagement from './_components/JudgesManagement';

export default async function JudgesPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get hackathon details
  const hackathon = await db.query.hackathons.findFirst({
    where: eq(hackathons.id, params.id),
  });
  
  if (!hackathon) {
    redirect('/hackathons');
  }
  
  // Check if the user is the organizer
  const isOrganizer = hackathon.organizerId === userId;
  
  if (!isOrganizer) {
    redirect(`/hackathons/${params.id}`);
  }
  
  // Get all judges for this hackathon
  const judgesList = await db.query.judges.findMany({
    where: eq(judges.hackathonId, params.id),
    with: {
      user: true,
    },
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Judges</h1>
      <JudgesManagement 
        hackathonId={params.id} 
        initialJudges={judgesList} 
      />
    </div>
  );
} 