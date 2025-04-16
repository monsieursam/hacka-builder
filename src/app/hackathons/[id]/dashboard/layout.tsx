import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getHackathonByIdCached } from '@/actions/hackathon';
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

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { userId } = await auth();
  const hackathonId = params.id;
  
  const hackathon = await getHackathonByIdCached(hackathonId);
  const isOrganizer = userId === hackathon?.organizerId;
  
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>HackaBuilder - Dashboard</title>
        </head>
        <body>
          <DashboardClient 
            hackathonId={hackathonId} 
            isOrganizer={isOrganizer} 
            children={children} 
          />
        </body>
      </html>
    </ClerkProvider>
  );
} 