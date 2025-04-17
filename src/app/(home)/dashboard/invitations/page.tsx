import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { judges } from '@/db/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JudgeInvitationCard from './_components/JudgeInvitationCard';

export default async function InvitationsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get judge invitations for the current user
  const judgeInvitations = await db.query.judges.findMany({
    where: eq(judges.userId, userId),
    with: {
      hackathon: true,
    },
    orderBy: (judges, { desc }) => [desc(judges.invitedAt)],
  });
  
  // Separate pending and accepted invitations
  const pendingInvitations = judgeInvitations.filter(judge => !judge.isAccepted);
  const acceptedInvitations = judgeInvitations.filter(judge => judge.isAccepted);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Invitations</h1>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingInvitations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingInvitations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingInvitations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvitations.map(invitation => (
                <JudgeInvitationCard 
                  key={invitation.id} 
                  invitation={invitation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">No pending invitations</h3>
              <p className="text-gray-500">You don't have any pending judge invitations.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="accepted">
          {acceptedInvitations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {acceptedInvitations.map(invitation => (
                <JudgeInvitationCard 
                  key={invitation.id} 
                  invitation={invitation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">No accepted invitations</h3>
              <p className="text-gray-500">You haven't accepted any judge invitations yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 