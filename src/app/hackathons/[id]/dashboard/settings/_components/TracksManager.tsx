'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createTrack, updateTrack, deleteTrack, getTracksForHackathon } from '@/actions/tracks';

interface Track {
  id: string;
  name: string;
  description: string | null;
  hackathonId: string;
}

interface TracksManagerProps {
  hackathonId: string;
}

export function TracksManager({ hackathonId }: TracksManagerProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Fetch tracks on component mount
  useEffect(() => {
    async function fetchTracks() {
      try {
        const tracksData = await getTracksForHackathon(hackathonId);
        setTracks(tracksData);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        toast.error('Failed to load tracks');
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [hackathonId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open dialog to add a new track
  const handleAddTrack = () => {
    setEditTrack(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  // Open dialog to edit an existing track
  const handleEditTrack = (track: Track) => {
    setEditTrack(track);
    setFormData({
      name: track.name,
      description: track.description || '',
    });
    setIsDialogOpen(true);
  };

  // Open confirmation dialog to delete a track
  const handleDeleteClick = (track: Track) => {
    setTrackToDelete(track);
    setIsDeleteDialogOpen(true);
  };

  // Submit form to create or update a track
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Track name is required');
      return;
    }

    try {
      if (editTrack) {
        // Update existing track
        const updatedTrack = await updateTrack({
          id: editTrack.id,
          name: formData.name,
          description: formData.description,
          hackathonId,
        });

        setTracks(prev => 
          prev.map(track => track.id === editTrack.id ? updatedTrack : track)
        );
        toast.success('Track updated successfully');
      } else {
        // Create new track
        const newTrack = await createTrack({
          name: formData.name,
          description: formData.description,
          hackathonId,
        });

        setTracks(prev => [...prev, newTrack]);
        toast.success('Track created successfully');
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving track:', error);
      toast.error(`Failed to ${editTrack ? 'update' : 'create'} track`);
    }
  };

  // Delete a track
  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;

    try {
      await deleteTrack(trackToDelete.id);
      setTracks(prev => prev.filter(track => track.id !== trackToDelete.id));
      toast.success('Track deleted successfully');
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Failed to delete track');
    } finally {
      setIsDeleteDialogOpen(false);
      setTrackToDelete(null);
    }
  };

  if (loading) {
    return <div className="py-4 text-center">Loading tracks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Hackathon Tracks</h3>
        <Button onClick={handleAddTrack} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Track
        </Button>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No tracks have been created yet</p>
          <Button variant="outline" onClick={handleAddTrack}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Track
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tracks.map(track => (
            <div 
              key={track.id} 
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h4 className="font-medium">{track.name}</h4>
                {track.description && (
                  <p className="text-sm text-gray-500 mt-1">{track.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditTrack(track)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteClick(track)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog for adding/editing tracks */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTrack ? 'Edit Track' : 'Add New Track'}
            </DialogTitle>
            <DialogDescription>
              {editTrack 
                ? 'Update the information for this track' 
                : 'Create a new track for participants to choose from'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Track Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., AI/ML, Web3, Mobile Apps"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this track is about..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editTrack ? 'Update Track' : 'Create Track'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting - replaced AlertDialog with Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the track "{trackToDelete?.name}". 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 