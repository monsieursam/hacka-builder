'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Trophy, 
  Inbox, 
  Users, 
  BookOpen, 
  Bell, 
  Home, 
  LayoutDashboard, 
  Award, 
  Settings, 
  ChevronRight,
  FileText,
  UserCog
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardClientProps {
  hackathonId: string;
  isOrganizer: boolean;
  children: React.ReactNode;
}

export default function DashboardClient({ 
  hackathonId,
  isOrganizer,
  children 
}: DashboardClientProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    const fullPath = `/hackathons/${hackathonId}/dashboard/${path}`;
    if (path === '') {
      return pathname === `/hackathons/${hackathonId}/dashboard`;
    }
    return pathname.startsWith(fullPath);
  };

  // Determine the current section title based on the pathname
  const getPageTitle = () => {
    if (pathname === `/hackathons/${hackathonId}/dashboard`) {
      return 'Dashboard Overview';
    } else if (pathname.includes('/submissions')) {
      return 'Submissions';
    } else if (pathname.includes('/teams')) {
      return 'Registered Teams';
    } else if (pathname.includes('/prizes')) {
      return 'Prizes';
    } else if (pathname.includes('/my-team')) {
      return 'My Team';
    } else if (pathname.includes('/resources')) {
      return 'Resources';
    } else if (pathname.includes('/announcements')) {
      return 'Announcements';
    } else if (pathname.includes('/leaderboard')) {
      return 'Leaderboard';
    } else if (pathname.includes('/judges')) {
      return 'Judges';
    } else if (pathname.includes('/settings')) {
      return 'Hackathon Settings';
    } else if (pathname.includes('/submit')) {
      return 'Submit Project';
    } else {
      return 'Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="border-r flex flex-col h-full">
          <SidebarHeader className="border-b px-4 py-3">
            <Link href={`/hackathons/${hackathonId}`} className="flex items-center">
              <h2 className="text-lg font-semibold">Hackathon Dashboard</h2>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-2 overflow-y-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard`}>
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Overview
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Participant Section */}
              <div className="mt-4 mb-2">
                <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Participation
                </h3>
                <Separator className="mb-2" />
              </div>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('my-team')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/my-team`}>
                    <Users className="mr-2 h-5 w-5" />
                    My Team
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('submit')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/submit`}>
                    <FileText className="mr-2 h-5 w-5" />
                    Submit Project
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Hackathon Info Section */}
              <div className="mt-4 mb-2">
                <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hackathon Info
                </h3>
                <Separator className="mb-2" />
              </div>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('submissions')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/submissions`}>
                    <Inbox className="mr-2 h-5 w-5" />
                    Submissions
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('teams')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/teams`}>
                    <Users className="mr-2 h-5 w-5" />
                    Teams
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('leaderboard')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/leaderboard`}>
                    <Award className="mr-2 h-5 w-5" />
                    Leaderboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('judges')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/judges`}>
                    <UserCog className="mr-2 h-5 w-5" />
                    Judges
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('prizes')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/prizes`}>
                    <Trophy className="mr-2 h-5 w-5" />
                    Prizes
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('resources')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/resources`}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Resources
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('announcements')}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}/dashboard/announcements`}>
                    <Bell className="mr-2 h-5 w-5" />
                    Announcements
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-2 mt-auto">
            <div className="space-y-2">
              {/* Only render Settings link if user is an organizer */}
              {isOrganizer && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('settings')}
                    size="lg"
                  >
                    <Link href={`/hackathons/${hackathonId}/dashboard/settings`}>
                      <Settings className="mr-2 h-5 w-5" />
                      Settings
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={false}
                  size="lg"
                >
                  <Link href={`/hackathons/${hackathonId}`}>
                    <Home className="mr-2 h-5 w-5" />
                    Back to Hackathon
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 bg-white">
            <SidebarTrigger>
              <Button variant="ghost" size="icon" className="md:hidden">
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
            
            <h2 className="text-xl font-bold flex-1">{getPageTitle()}</h2>
            
            {/* Add user avatar in header */}
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 