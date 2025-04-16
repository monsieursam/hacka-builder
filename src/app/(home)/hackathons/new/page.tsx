import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateHackathonForm } from "../_components/CreateHackathonForm";
import Link from 'next/link';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

export default async function NewHackathonPage() {
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
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
              <BreadcrumbPage>Create New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="text-3xl font-bold mb-8">Create a New Hackathon</h1>
        <CreateHackathonForm userId={userId} />
      </div>
    </main>
  );
} 