import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { db } from '@/db';
import { resources } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ResourceForm } from '../../_components/ResourceForm';

export default async function EditResourcePage({ 
  params 
}: { 
  params: Promise<{ id: string, resourceId: string }> 
}) {
  const { id: hackathonId, resourceId } = await params;
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
  
  // Get the resource
  const resource = await db.query.resources.findFirst({
    where: eq(resources.id, resourceId)
  });
  
  if (!resource || resource.hackathonId !== hackathonId) {
    redirect(`/hackathons/${hackathonId}/dashboard/resources`);
  }

  return (
    <div className="py-8 px-6">
      <h2 className="text-2xl font-bold mb-6">Edit Resource</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm 
            hackathonId={hackathonId}
            resource={resource}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </div>
  );
} 