import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { hackathons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateHackathonForm } from "../../_components/CreateHackathonForm";
import Link from 'next/link';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { DeleteHackathonButton } from '@/components/hackathons/DeleteHackathonButton';
import { Separator } from '@/components/ui/separator';

export default async function EditHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  // Get current user
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  const {id: hackathonId} = await params;
  
  if (!hackathonId) {
    notFound();
  }
  
  // Get hackathon data
  const hackathon = await db.query.hackathons.findFirst({
    where: eq(hackathons.id, hackathonId)
  });
  
  // Check if hackathon exists
  if (!hackathon) {
    notFound();
  }
  
  // Check if user is the organizer
  if (hackathon.organizerId !== userId) {
    // Not authorized to edit this hackathon
    redirect(`/hackathons/${hackathonId}`);
  }

  return (
    <main className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/hackathons">Hackathons</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/hackathons/${hackathon.id}`}>{hackathon.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Hackathon</h1>
          <DeleteHackathonButton 
            hackathonId={hackathon.id} 
            hackathonName={hackathon.name} 
          />
        </div>
        
        <Separator className="mb-8" />
        
        <CreateHackathonForm 
          userId={userId} 
          hackathon={hackathon} 
          isEditing={true} 
        />
      </div>
    </main>
  );
} 