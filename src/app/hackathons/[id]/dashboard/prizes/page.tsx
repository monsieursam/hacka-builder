import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { PrizeForm } from '../../_components/PrizeForm';
import { EditPrizeDialog } from '../../_components/EditPrizeDialog';
import { Trophy, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePrize } from '@/actions/prizes';

export default async function PrizesPage({ 
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
  
  // Only organizers should be able to access this page
  if (!isOrganizer) {
    redirect(`/hackathons/${hackathonId}/dashboard`);
  }

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Prizes</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Prize List Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Existing Prizes</h3>
          
          {hackathon.prizes && hackathon.prizes.length > 0 ? (
            <div className="space-y-4">
              {hackathon.prizes.map((prize) => (
                <Card key={prize.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{prize.name}</h4>
                        <p className="text-sm text-gray-600">{prize.description}</p>
                        {prize.value && (
                          <p className="text-sm font-medium">
                            {prize.value} {prize.currency || 'USD'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <EditPrizeDialog prize={prize} hackathonId={hackathon.id} />
                      <button 
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this prize?")) {
                            const result = await deletePrize(prize.id);
                            if (result.success) {
                              toast.success("Prize deleted successfully");
                            } else {
                              toast.error(result.error || "Failed to delete prize");
                            }
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">No prizes created yet</h3>
              <p className="text-gray-500 mb-2">Add your first prize to motivate participants</p>
            </div>
          )}
        </div>
        
        {/* Add Prize Form */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add a New Prize</h3>
            <PrizeForm hackathonId={hackathon.id} />
          </Card>
        </div>
      </div>
    </div>
  );
} 