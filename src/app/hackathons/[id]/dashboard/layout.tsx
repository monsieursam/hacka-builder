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
} from '@/components/ui/sidebar';

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

  return (
    <SidebarProvider>
      <div className="flex">
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
        <div className="flex-1">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
} 