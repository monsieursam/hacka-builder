import { getHackathonsCached } from '@/actions/hackathon';
import { HackathonsList } from './_components/HackathonsList';
import Link from 'next/link';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

export default async function HackathonsPage() {
  // Fetch hackathons server-side using the cached action
  const hackathons = await getHackathonsCached();
  
  return (
    <main className="py-12 px-4">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Hackathons</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <HackathonsList initialHackathons={hackathons} />
    </main>
  );
} 