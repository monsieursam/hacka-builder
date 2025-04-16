'use client';

import { useState, FormEvent, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { hackathonStatusEnum, Hackathon } from '@/db/schema';
import { createHackathon, updateHackathon, HackathonFormData } from '@/actions/hackathon';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface CreateHackathonFormProps {
  userId: string;
  hackathon?: Hackathon;
  isEditing?: boolean;
}

export function CreateHackathonForm({ userId, hackathon, isEditing = false }: CreateHackathonFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isVirtual: false,
    maxTeamSize: 5,
    minTeamSize: 1,
    maxParticipants: 0,
    maxTeams: 0,
    status: 'draft',
    registrationStatus: 'closed',
    showAllSubmissions: false,
  });

  // If editing, populate form with existing hackathon data
  useEffect(() => {
    if (isEditing && hackathon) {
      setFormData({
        name: hackathon.name,
        description: hackathon.description || '',
        startDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : '',
        endDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : '',
        location: hackathon.location || '',
        isVirtual: hackathon.isVirtual,
        maxTeamSize: hackathon.maxTeamSize,
        minTeamSize: hackathon.minTeamSize,
        maxParticipants: hackathon.maxParticipants || 0,
        maxTeams: hackathon.maxTeams || 0,
        status: hackathon.status,
        registrationStatus: hackathon.registrationStatus,
        showAllSubmissions: hackathon.showAllSubmissions || false,
      });
    }
  }, [isEditing, hackathon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Please fill out all required fields');
      return;
    }

    // Parse dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    // Validate dates
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }

    startTransition(async () => {
      try {
        const hackathonData = {
          ...formData,
          startDate,
          endDate,
        };

        if (isEditing && hackathon) {
          // Update existing hackathon
          const updatedHackathon = await updateHackathon(hackathon.id, hackathonData);
          
          toast.success('Hackathon updated successfully!');
          router.push(`/hackathons/${updatedHackathon.id}`);
        } else {
          // Create new hackathon
          const newHackathon = await createHackathon({
            ...hackathonData,
            organizerId: userId,
          });
          
          toast.success('Hackathon created successfully!');
          router.push(`/hackathons/${newHackathon.id}`);
        }
      } catch (error) {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} hackathon:`, error);
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} hackathon. Please try again.`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Name*
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Hackathon Name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {hackathonStatusEnum.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium">
            Start Date*
          </label>
          <Input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium">
            End Date*
          </label>
          <Input
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location (optional if virtual)"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="registrationStatus" className="block text-sm font-medium">
            Registration Status
          </label>
          <Select
            value={formData.registrationStatus}
            onValueChange={(value) => handleSelectChange('registrationStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select registration status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="open">Open</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="minTeamSize" className="block text-sm font-medium">
            Min Team Size
          </label>
          <Input
            id="minTeamSize"
            name="minTeamSize"
            type="number"
            min="1"
            value={formData.minTeamSize}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="maxTeamSize" className="block text-sm font-medium">
            Max Team Size
          </label>
          <Input
            id="maxTeamSize"
            name="maxTeamSize"
            type="number"
            min="1"
            value={formData.maxTeamSize}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="maxParticipants" className="block text-sm font-medium">
            Max Participants (0 for unlimited)
          </label>
          <Input
            id="maxParticipants"
            name="maxParticipants"
            type="number"
            min="0"
            value={formData.maxParticipants}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex items-center space-x-2">
          <input
            id="isVirtual"
            name="isVirtual"
            type="checkbox"
            checked={formData.isVirtual}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="isVirtual" className="text-sm font-medium">
            Virtual Hackathon
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="showAllSubmissions"
            name="showAllSubmissions"
            type="checkbox"
            checked={formData.showAllSubmissions}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="showAllSubmissions" className="text-sm font-medium">
            Allow participants to view all submissions
          </label>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description*
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the hackathon, its goals, and what participants can expect..."
          rows={5}
          required
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Hackathon'}
        </Button>
      </div>
    </form>
  );
} 