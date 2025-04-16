'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchUsers } from '@/actions/users';
import type { User } from '@/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface UserSearchProps {
  onSelectUser?: (user: User) => void;
  placeholder?: string;
  className?: string;
}

export function UserSearch({ 
  onSelectUser, 
  placeholder = 'Search users by name or email',
  className = ''
}: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const users = await searchUsers(query);
      setResults(users);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelectUser = (user: User) => {
    if (onSelectUser) {
      onSelectUser(user);
    }
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !query.trim()}
          type="button"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
          <ul className="py-1 max-h-60 overflow-auto">
            {results.map((user) => (
              <li 
                key={user.id} 
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                onClick={() => handleSelectUser(user)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image_url || undefined} alt={user.first_name || user.email} />
                  <AvatarFallback>
                    {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.email}
                  </div>
                  {user.first_name && user.last_name && (
                    <div className="text-sm text-gray-500">{user.email}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResults && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4 text-center text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
} 