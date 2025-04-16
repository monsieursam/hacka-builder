import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateHackathonForm } from '@/app/hackathons/_components/CreateHackathonForm';
import { TracksManager } from './_components/TracksManager';
import { PartnersManager } from './_components/PartnersManager';
import { AdvancedSettings } from './_components/AdvancedSettings';

export default async function HackathonSettingsPage({ 
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
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }

  return (
    <div className="py-8 px-6">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="tracks">Tracks & Categories</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Hackathon Details</CardTitle>
              <CardDescription>
                Update your hackathon's general information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateHackathonForm 
                userId={userId} 
                hackathon={hackathon} 
                isEditing={true} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracks">
          <Card>
            <CardHeader>
              <CardTitle>Tracks & Categories</CardTitle>
              <CardDescription>
                Manage the tracks and categories for your hackathon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TracksManager hackathonId={hackathonId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Partners & Sponsors</CardTitle>
              <CardDescription>
                Manage partners and sponsors for your hackathon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PartnersManager hackathonId={hackathonId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced hackathon options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedSettings 
                hackathonId={hackathonId} 
                leaderboardPublished={hackathon.leaderboardPublished} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 