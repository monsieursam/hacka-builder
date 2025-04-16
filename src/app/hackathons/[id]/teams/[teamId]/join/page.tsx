'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { requestToJoinTeam } from '@/actions/teams';
import { toast } from '@/lib/toast';
import { useAuth } from '@clerk/nextjs';

export default function JoinTeamRequestPage({ 
  params 
}: { 
  params: { id: string, teamId: string } 
}) {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push(`/sign-in?redirect=/hackathons/${params.id}/teams/${params.teamId}/join`);
    }
  }, [isLoaded, userId, router, params.id, params.teamId]);

  // Show loading state while authentication is being checked
  if (!isLoaded || !userId) {
    return (
      <main className="pb-12">
        <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await requestToJoinTeam(params.teamId, message);
      
      if (result.success) {
        toast({
          title: 'Request sent!',
          description: 'Your request to join the team has been sent. You will be notified when the team responds.',
          variant: 'default',
        });
        router.push(`/hackathons/${params.id}/teams/${params.teamId}`);
      } else {
        toast({
          title: 'Failed to send request',
          description: result.error || 'An error occurred while sending your request.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pb-12">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 py-4">
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
                <Link href={`/hackathons/${params.id}`}>Hackathon</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${params.id}/teams/${params.teamId}`}>Team</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Join Request</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Request to Join Team</h1>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Team (Optional)
              </label>
              <Textarea
                placeholder="Introduce yourself and explain why you'd like to join this team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tell the team about your skills, interests, and why you want to join.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Request...' : 'Send Request'}
              </Button>
              <Button variant="outline" type="button" asChild>
                <Link href={`/hackathons/${params.id}/teams/${params.teamId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
} 