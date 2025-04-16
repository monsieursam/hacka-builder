'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hackathon, hackathonStatusEnum } from '@/db/schema';


type HackathonsListProps = {
  initialHackathons: Hackathon[];
}

export function HackathonsList({ initialHackathons }: HackathonsListProps) {
  const [hackathons] = useState<Hackathon[]>(initialHackathons);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>(initialHackathons);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'startDate' | 'name'>('startDate');

  // Apply filters whenever search query, status filter, or sort option changes
  useEffect(() => {
    let results = [...hackathons];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        hackathon => 
          hackathon.name.toLowerCase().includes(query) || 
          hackathon.description.toLowerCase().includes(query) ||
          (hackathon.location && hackathon.location.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter (if we're not already filtering server-side)
    if (statusFilter !== 'all') {
      results = results.filter(hackathon => hackathon.status === statusFilter);
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredHackathons(results);
  }, [hackathons, searchQuery, statusFilter, sortOption]);

  // Format date range for display
  const formatDateRange = (start: Date, end: Date) => {
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  // Get status badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'published':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-purple-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">All Hackathons</h1>
        <Button asChild>
          <Link href="/hackathons/new">Create Hackathon</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="md:w-1/3">
          <Input
            placeholder="Search hackathons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {hackathonStatusEnum.map((status) => (
                <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={sortOption} 
            onValueChange={(value) => setSortOption(value as 'startDate' | 'name')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDate">Start Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hackathon Grid */}
      {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 relative">
                {hackathon.banner ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${hackathon.banner})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 ${getStatusColor(hackathon.status)} rounded-full text-white text-sm uppercase`}>
                  {hackathon.status}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-gray-500 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDateRange(hackathon.startDate, hackathon.endDate)}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {hackathon.isVirtual ? 'Virtual' : hackathon.location}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{hackathon.description}</p>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/hackathons/${hackathon.id}`}>View Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-2">No hackathons found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setSortOption('startDate');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
} 