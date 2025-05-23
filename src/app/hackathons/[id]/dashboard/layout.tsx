import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
import { getUserTeamForHackathon } from '@/actions/teams';
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
import { ClerkProvider } from '@clerk/nextjs';
import DashboardClient from './_components/DashboardClient';

import '@/app/globals.css';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const hackathonId = (await params).id;
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  const isOrganizer = userId === hackathon?.organizerId;
  
  if (!hackathon || !userId) {
    return null;
  }
  
  // Check if the user is part of a team for this hackathon
  const userTeam = await getUserTeamForHackathon(userId, hackathonId);
  const isTeamMember = !!userTeam;
  
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>{hackathon.name} - Dashboard | HackaBuilder</title>
        </head>
        <body>
          <DashboardClient 
            hackathonId={hackathonId}
            hackathonName={hackathon.name}
            isOrganizer={isOrganizer}
            isTeamMember={isTeamMember}
            children={children} 
          />
        </body>
      </html>
    </ClerkProvider>
  );
} 