'use client';

import { UserSearch } from '@/components/UserSearch';
import { User } from '@/db/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserSearchFormExample() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUser) {
      alert(`Form submitted for user: ${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.email})`);
      // You would typically send this to a server action
    } else {
      alert('Please select a user first');
    }
  };
  
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">User Search in Forms</h1>
      <p className="text-gray-600">
        This example shows how to integrate the user search component with a form.
      </p>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select a User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Search and select a user
            </label>
            
            <UserSearch 
              onSelectUser={(user: User) => setSelectedUser(user)}
              placeholder="Search by name or email"
            />
            
            {selectedUser && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected User:</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.image_url || undefined} alt={selectedUser.first_name || selectedUser.email} />
                    <AvatarFallback>
                      {(selectedUser.first_name?.[0] || selectedUser.email[0]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedUser.first_name && selectedUser.last_name 
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.email}
                    </div>
                    {selectedUser.first_name && selectedUser.last_name && (
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={!selectedUser}>
              Continue with Selected User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 