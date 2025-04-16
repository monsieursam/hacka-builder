import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { ResourceForm } from '../_components/ResourceForm';

export default async function AddResourcePage({ 
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
  
  // Check if the user is the organizer
  if (userId !== hackathon.organizerId) {
    redirect(`/hackathons/${hackathonId}/dashboard/resources`);
  }

  return (
    <div className="py-8 px-6">
      <h2 className="text-2xl font-bold mb-6">Add Resource</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm hackathonId={hackathonId} />
        </CardContent>
      </Card>
    </div>
  );
} 