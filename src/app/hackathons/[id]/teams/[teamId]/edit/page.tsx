import { TeamJoinRequests } from '../_components/TeamJoinRequests';

export default async function EditTeamPage({ 
  params 
}: { 
  params: { id: string, teamId: string } 
}) {
  return (
    <main className="pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Team</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* ... existing team form code ... */}
          </div>
          
          <div className="space-y-6">
            {/* ... existing sidebar code ... */}
            
            {/* Join Requests Section */}
            <TeamJoinRequests 
              teamId={params.teamId} 
              hackathonId={params.id}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 