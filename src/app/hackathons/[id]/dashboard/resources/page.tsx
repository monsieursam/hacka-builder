import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, FileText, Link as LinkIcon } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getResourcesByHackathonId } from '@/actions/resources';

export default async function ResourcesPage({ 
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
  
  // Get resources for this hackathon
  const resources = await getResourcesByHackathonId(hackathonId);
  
  // Group resources by category
  const documentationResources = resources.filter(r => r.category === 'documentation');
  const linksResources = resources.filter(r => r.category === 'links');
  const technicalResources = resources.filter(r => r.category === 'technical');
  const supportResources = resources.filter(r => r.category === 'support');

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hackathon Resources</h2>
        
        {isOrganizer && (
          <Button asChild>
            <Link href={`/hackathons/${hackathonId}/dashboard/resources/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Link>
          </Button>
        )}
      </div>
      
      {resources.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-6">No resources have been added yet.</p>
          {isOrganizer && (
            <Button asChild>
              <Link href={`/hackathons/${hackathonId}/dashboard/resources/add`}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Resource
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentationResources.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Documentation</h3>
              <ul className="space-y-3">
                {documentationResources.map((resource) => (
                  <li key={resource.id}>
                    <div className="flex items-start justify-between gap-2">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-600 hover:underline flex items-center gap-2"
                      >
                        <FileText className="h-5 w-5" />
                        {resource.title}
                      </a>
                      
                      {isOrganizer && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                          className="ml-auto"
                        >
                          <Link href={`/hackathons/${hackathonId}/dashboard/resources/${resource.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mt-1 ml-7">{resource.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {linksResources.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Useful Links</h3>
              <ul className="space-y-3">
                {linksResources.map((resource) => (
                  <li key={resource.id}>
                    <div className="flex items-start justify-between gap-2">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-600 hover:underline flex items-center gap-2"
                      >
                        <LinkIcon className="h-5 w-5" />
                        {resource.title}
                      </a>
                      
                      {isOrganizer && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                          className="ml-auto"
                        >
                          <Link href={`/hackathons/${hackathonId}/dashboard/resources/${resource.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mt-1 ml-7">{resource.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {technicalResources.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Technical Resources</h3>
              <ul className="space-y-3">
                {technicalResources.map((resource) => (
                  <li key={resource.id}>
                    <div className="flex items-start justify-between gap-2">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-600 hover:underline flex items-center gap-2"
                      >
                        <LinkIcon className="h-5 w-5" />
                        {resource.title}
                      </a>
                      
                      {isOrganizer && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                          className="ml-auto"
                        >
                          <Link href={`/hackathons/${hackathonId}/dashboard/resources/${resource.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mt-1 ml-7">{resource.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {supportResources.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-3">
                {supportResources.map((resource) => (
                  <li key={resource.id}>
                    <div className="flex items-start justify-between gap-2">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-600 hover:underline flex items-center gap-2"
                      >
                        <LinkIcon className="h-5 w-5" />
                        {resource.title}
                      </a>
                      
                      {isOrganizer && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                          className="ml-auto"
                        >
                          <Link href={`/hackathons/${hackathonId}/dashboard/resources/${resource.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mt-1 ml-7">{resource.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 