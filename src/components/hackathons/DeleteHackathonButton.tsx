'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteHackathon } from '@/actions/hackathon';
import { Trash2 } from 'lucide-react';

interface DeleteHackathonButtonProps {
  hackathonId: string;
  hackathonName: string;
  className?: string;
}

export function DeleteHackathonButton({ hackathonId, hackathonName, className }: DeleteHackathonButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteHackathon(hackathonId);
      
      if (result.success) {
        toast.success('Hackathon deleted successfully');
        router.push('/hackathons');
      } else {
        toast.error(result.error || 'Failed to delete hackathon');
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      toast.error('An unexpected error occurred');
      setShowConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="lg" 
        onClick={() => setShowConfirmation(true)}
        className={className}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Hackathon
      </Button>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Are you absolutely sure?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the hackathon "{hackathonName}" 
              and all associated data including teams, submissions, and track information.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Hackathon'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 