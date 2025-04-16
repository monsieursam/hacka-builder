import { getHackathonByIdCached } from '@/actions/hackathon';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import RulesEditor from '@/components/hackathons/RulesEditor';

export default async function HackathonRulesPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const hackathon = await getHackathonByIdCached(params.id);

  if (!hackathon) {
    notFound();
  }

  const isOrganizer = userId === hackathon.organizerId;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Hackathon Rules</h1>
      
      {isOrganizer ? (
        <RulesEditor 
          hackathonId={hackathon.id} 
          initialRules={hackathon.rules || ''} 
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{hackathon.name} Rules</h2>
          {hackathon.rules ? (
            <div className="prose dark:prose-invert max-w-none">
              {/* Display the rules with proper formatting */}
              <div dangerouslySetInnerHTML={{ __html: hackathon.rules.replace(/\n/g, '<br />') }} />
            </div>
          ) : (
            <p className="text-gray-500">No rules have been specified for this hackathon yet.</p>
          )}
        </div>
      )}
    </div>
  );
} 