'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createTeam } from '@/actions/teams';
import { useFormStatus } from 'react-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

// Submit Button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Team'}
    </Button>
  );
}

export default function CreateTeamPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const router = useRouter();
  const hackathonId = params.id;
  const [formError, setFormError] = useState<string | null>(null);
  
  // Create a client action to handle the form submission
  async function handleCreateTeam(formData: FormData) {
    // Clear any previous errors
    setFormError(null);
    
    try {
      // Add hackathonId to the form data
      formData.append('hackathonId', hackathonId);
      
      // Call the server action
      const result = await createTeam(formData);
      
      // If there's an error returned from the server action
      if (result && !result.success) {
        setFormError(result.error || 'An unknown error occurred');
        toast.error(result.error || 'An unknown error occurred');
      } else if (result && result.success) {
        // Show success message
        toast.success('Team created successfully!');
        
        // Navigate to the dashboard
        router.push(`/hackathons/${result.hackathonId}/dashboard`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setFormError('An unexpected error occurred');
      toast.error('Failed to create team. Please try again.');
    }
  }

  return (
    <main className="pb-12">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/hackathons">Hackathons</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathonId}`}>Hackathon</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Team</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">Create Your Team</h1>
            <p className="text-white/80">
              Form a team to participate in the hackathon
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form action={handleCreateTeam} className="space-y-6 bg-white p-8 rounded-lg shadow">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {formError}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Team Name*
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your team name"
              required
              minLength={3}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Team Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your team and what you're looking to build..."
              rows={5}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox" 
              id="lookingForMembers" 
              name="lookingForMembers"
              defaultChecked={true}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="lookingForMembers" className="text-sm font-medium">
              We're looking for more team members
            </label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/hackathons/${hackathonId}/dashboard`}>Cancel</Link>
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
} 