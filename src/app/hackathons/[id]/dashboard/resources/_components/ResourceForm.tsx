'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { createResource, updateResource, ResourceFormData } from '@/actions/resources';
import { Resource } from '@/db/schema';
import { toast } from 'sonner';

interface ResourceFormProps {
  hackathonId: string;
  resource?: Resource;
  isEditing?: boolean;
}

export function ResourceForm({ hackathonId, resource, isEditing = false }: ResourceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState<ResourceFormData>({
    title: resource?.title || '',
    url: resource?.url || '',
    description: resource?.description || '',
    category: resource?.category || 'documentation',
    order: resource?.order || 0,
  });

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.url || !formData.category) {
      toast.error('Please fill out all required fields');
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch (err) {
      toast.error('Please enter a valid URL (including http:// or https://)');
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && resource) {
          // Update existing resource
          await updateResource(resource.id, formData);
          toast.success('Resource updated successfully!');
        } else {
          // Create new resource
          await createResource(hackathonId, formData);
          toast.success('Resource added successfully!');
        }
        
        // Redirect back to resources page
        router.push(`/hackathons/${hackathonId}/dashboard/resources`);
        router.refresh();
      } catch (error) {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} resource:`, error);
        toast.error(`Failed to ${isEditing ? 'update' : 'add'} resource. Please try again.`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title*
          </label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Resource Title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="url" className="block text-sm font-medium">
            URL*
          </label>
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/resource"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Brief description of the resource"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium">
            Category*
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="links">Useful Links</SelectItem>
              <SelectItem value="technical">Technical Resources</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="order" className="block text-sm font-medium">
            Display Order
          </label>
          <Input
            id="order"
            name="order"
            type="number"
            min="0"
            value={formData.order || 0}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500">Lower numbers will display first</p>
        </div>
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
          {isPending 
            ? (isEditing ? 'Saving...' : 'Adding...') 
            : (isEditing ? 'Save Changes' : 'Add Resource')
          }
        </Button>
      </div>
    </form>
  );
} 