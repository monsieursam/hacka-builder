"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { inviteJudge } from '@/actions/judges';
import { Mail } from 'lucide-react';

// Form schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof formSchema>;

interface InviteJudgeFormProps {
  hackathonId: string;
}

export function InviteJudgeForm({ hackathonId }: InviteJudgeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await inviteJudge({
        hackathonId,
        email: data.email,
      });
      
      if (result.success) {
        // Reset form and show success message
        form.reset();
        router.push(`/hackathons/${hackathonId}/dashboard/judges?success=${encodeURIComponent('Judge invitation sent successfully')}`);
      } else {
        // Show error message
        router.push(`/hackathons/${hackathonId}/dashboard/judges?error=${encodeURIComponent(result.error || 'Failed to invite judge')}`);
      }
    } catch (error) {
      console.error('Error inviting judge:', error);
      router.push(`/hackathons/${hackathonId}/dashboard/judges?error=${encodeURIComponent('Failed to invite judge')}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input 
                    placeholder="judge@example.com" 
                    {...field}
                    disabled={isSubmitting}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The user must be registered on the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </Button>
      </form>
    </Form>
  );
} 