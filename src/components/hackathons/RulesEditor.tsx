'use client';

import { useState } from 'react';
import { updateHackathonRules } from '@/actions/hackathon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RulesEditorProps {
  hackathonId: string;
  initialRules: string;
}

export default function RulesEditor({ hackathonId, initialRules }: RulesEditorProps) {
  const [rules, setRules] = useState(initialRules);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      await updateHackathonRules(hackathonId, rules);
      toast.success("Rules updated successfully");
    } catch (error) {
      toast.error("Failed to update rules");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Edit Hackathon Rules</h2>
        <p className="text-sm text-gray-500 mb-4">
          Define the rules and guidelines for participants. Be clear about submission requirements, deadlines, 
          judging criteria, and any code of conduct participants should follow.
        </p>
      </div>

      <Textarea
        value={rules}
        onChange={(e) => setRules(e.target.value)}
        placeholder="Enter hackathon rules and guidelines..."
        className="min-h-[400px] mb-4"
      />

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="ml-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Rules'}
        </Button>
      </div>
    </div>
  );
} 