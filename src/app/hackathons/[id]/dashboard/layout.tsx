'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Trophy, Inbox, Users, BookOpen, Bell, Home, LayoutDashboard } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const hackathonId = params.id as string;
  
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
    } else {
      return 'Dashboard';
    }
  };

  return (
    <SidebarProvider>
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Hackathon Dashboard</h2>
          </SidebarHeader>
          <SidebarContent className="p-2">
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
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 w-full">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
          </header>
          <div className="flex-1">
            {children}
          </div>
        </SidebarInset>
    </SidebarProvider>
  );
} 