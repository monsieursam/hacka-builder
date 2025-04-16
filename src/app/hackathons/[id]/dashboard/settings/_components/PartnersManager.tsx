'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Partner } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createPartner, updatePartner, deletePartner, getPartnersByHackathon, PartnerFormData } from '@/actions/partners';
import { toast } from 'sonner';
import { X, Edit, Plus, Globe, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface PartnersManagerProps {
  hackathonId: string;
}

export function PartnersManager({ hackathonId }: PartnersManagerProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    description: '',
    logo: '',
    website: '',
    hackathonId: hackathonId,
  });

  const fetchPartners = async () => {
    try {
      const partnersList = await getPartnersByHackathon(hackathonId);
      setPartners(partnersList);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load partners');
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [hackathonId]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      hackathonId: hackathonId,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingPartnerId) {
        await updatePartner(editingPartnerId, formData);
        toast.success('Partner updated successfully');
      } else {
        await createPartner(formData);
        toast.success('Partner added successfully');
      }

      resetForm();
      setShowAddForm(false);
      setEditingPartnerId(null);
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save partner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (partnerId: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      setIsLoading(true);
      try {
        await deletePartner(partnerId, hackathonId);
        toast.success('Partner deleted successfully');
        fetchPartners();
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast.error('Failed to delete partner');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      description: partner.description || '',
      logo: partner.logo || '',
      website: partner.website || '',
      hackathonId: hackathonId,
    });
    setEditingPartnerId(partner.id);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Partners & Sponsors</h3>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Partner
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium">
                  {editingPartnerId ? 'Edit Partner' : 'Add New Partner'}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPartnerId(null);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Partner Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Company or organization name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the partner (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="URL to partner's logo image (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Partner's website URL (optional)"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? 'Saving...'
                    : editingPartnerId
                    ? 'Update Partner'
                    : 'Add Partner'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {partners.length === 0 && !showAddForm ? (
        <div className="text-center py-8 text-gray-500">
          <p>No partners added yet. Add partners to showcase them on your hackathon page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {partner.logo ? (
                      <div className="h-12 w-12 relative overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-xs font-medium">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <h4 className="font-medium">{partner.name}</h4>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center"
                        >
                          <Globe className="w-3 h-3 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(partner)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(partner.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {partner.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {partner.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 