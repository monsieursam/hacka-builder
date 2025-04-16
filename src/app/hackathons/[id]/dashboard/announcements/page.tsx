import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';

export default async function AnnouncementsPage({ 
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
  
  // Check if the user is an organizer
  const isOrganizer = userId === hackathon.organizerId;

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Announcements</h2>
        {isOrganizer && (
          <Button asChild>
            <Link href={`/hackathons/${hackathon.id}/announcements/new`}>Create Announcement</Link>
          </Button>
        )}
      </div>
      
      {/* Just placeholder announcements for now - would be replaced with real data */}
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between mb-2">
            <h3 className="text-xl font-bold">Welcome to the Hackathon!</h3>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
          <p className="text-gray-700 mb-4">
            Welcome to all participants! We're excited to have you join us for this hackathon. 
            Be sure to check out the resources section for important information.
          </p>
          <div className="text-sm text-gray-500">
            Posted by Organizer
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between mb-2">
            <h3 className="text-xl font-bold">Workshops Schedule Updated</h3>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <p className="text-gray-700 mb-4">
            We've updated the schedule for workshops. Please check the resources section for the latest schedule.
          </p>
          <div className="text-sm text-gray-500">
            Posted by Organizer
          </div>
        </Card>
      </div>
    </div>
  );
} 