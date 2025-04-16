'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSubmission, deleteSubmission, SubmissionFormData } from '@/actions/submissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Track } from '@/db/schema';
import { Trash2 } from 'lucide-react';

interface SubmissionEditFormProps {
  hackathonId: string;
  submissionId: string;
  initialData: SubmissionFormData;
  teamName: string;
  tracks: Track[];
}

export default function SubmissionEditForm({ 
  hackathonId, 
  submissionId,
  initialData, 
  teamName, 
  tracks 
}: SubmissionEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SubmissionFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.projectName || !formData.description || !formData.repoUrl) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Validate GitHub URL format
      if (!formData.repoUrl.includes('github.com')) {
        toast.error('Repository URL should be a GitHub link');
        setIsSubmitting(false);
        return;
      }

      // Submit the form
      await updateSubmission(submissionId, formData);
      
      toast.success('Project updated successfully!');
      router.push(`/hackathons/${hackathonId}/dashboard`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submission deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSubmission(submissionId);
      if (result.success) {
        toast.success('Submission deleted successfully');
        router.push(`/hackathons/${hackathonId}/dashboard`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete submission');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle input changes
  const handleChange = (name: keyof SubmissionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name <span className="text-red-500">*</span></Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="Enter your project name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="trackId">Track (Optional)</Label>
              <Select value={formData.trackId} onValueChange={(value) => handleChange('trackId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Project Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Explain what your project does, technologies used, challenges faced, etc."
                className="mt-1 min-h-[150px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="repoUrl">GitHub Repository URL <span className="text-red-500">*</span></Label>
              <Input
                id="repoUrl"
                type="url"
                value={formData.repoUrl}
                onChange={(e) => handleChange('repoUrl', e.target.value)}
                placeholder="https://github.com/yourusername/yourproject"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="demoUrl">Demo URL (Optional)</Label>
              <Input
                id="demoUrl"
                type="url"
                value={formData.demoUrl}
                onChange={(e) => handleChange('demoUrl', e.target.value)}
                placeholder="https://your-live-demo-url.com"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to a live demo if available
              </p>
            </div>

            <div>
              <Label htmlFor="presentationUrl">Presentation URL (Optional)</Label>
              <Input
                id="presentationUrl"
                type="url"
                value={formData.presentationUrl}
                onChange={(e) => handleChange('presentationUrl', e.target.value)}
                placeholder="https://slides.com/your-presentation"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to your presentation/slides
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Updating submission for Team: {teamName}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Your updates will be visible to all team members and hackathon organizers.
            </p>
          </div>

          <div className="flex justify-between gap-4">
            <Button 
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting || isDeleting}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Submission
            </Button>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/hackathons/${hackathonId}/dashboard`)}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this submission?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your project submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 