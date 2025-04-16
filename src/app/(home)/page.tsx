import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/db';
import { hackathons } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { unstable_noStore as noStore, unstable_cache } from 'next/cache';


async function getLatestHackathons() {
  try {
    // In production, use the actual database query
    const latestHackathons = await db.query.hackathons.findMany({
      where: eq(hackathons.status, 'active'),
      orderBy: [desc(hackathons.startDate)],
      limit: 4,
    });

    return latestHackathons;
  } catch (error) {
    console.error('Failed to fetch hackathons:', error);
    
    // Return mock data as fallback
    return [
      {
        id: 1,
        name: 'AI for Good Hackathon',
        description: 'Build solutions that leverage AI to address social and environmental challenges.',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: 'active',
        banner: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070',
      },
      {
        id: 2,
        name: 'Web3 Innovation Challenge',
        description: 'Develop blockchain-based applications that solve real-world problems.',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        status: 'active',
        banner: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074',
      },
      {
        id: 3,
        name: 'Climate Tech Hackathon',
        description: 'Create innovative solutions to combat climate change and promote sustainability.',
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        status: 'active',
        banner: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=2070',
      },
    ];
  }
}

const getLatestHackathonsCached = unstable_cache(
  getLatestHackathons,
  ['my-app-user']
);

async function getFeaturedHackathon() {
  try {
    // In production, use the actual database query
    const featuredHackathon = await db.query.hackathons.findFirst({
      where: eq(hackathons.status, 'active'),
      orderBy: [desc(hackathons.startDate)],
    });

    return featuredHackathon;
  } catch (error) {
    console.error('Failed to fetch featured hackathon:', error);
    
    // Return mock data as fallback
    return {
      id: 1,
      name: 'AI for Good Hackathon',
      description: 'Build solutions that leverage AI to address social and environmental challenges.',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: 'active',
      banner: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070',
    };
  }
}

const getFeaturedHackathonCached = unstable_cache(
  getFeaturedHackathon,
  ['featured-hackathon']
);

export default async function LandingPage() {
  const latestHackathons = await getLatestHackathonsCached();
  const featuredHackathon = await getFeaturedHackathonCached();
  // Fetch data server-side using server actions
 

  // Format date range for display
  const formatDateRange = (start: Date, end: Date) => {
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Build, Innovate, and Collaborate</h1>
          <p className="text-lg md:text-xl mb-8">Join amazing hackathons, form teams with talented developers, and create projects that matter.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-purple-700 hover:bg-gray-100" size="lg" asChild>
              <Link href="/hackathons">Browse Hackathons</Link>
            </Button>
            <Button className="bg-transparent border border-white hover:bg-white/10" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Hackathon */}
      {featuredHackathon && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Hackathon</h2>
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-80 w-full">
                {featuredHackathon.banner ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${featuredHackathon.banner})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
                )}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">{featuredHackathon.name}</h3>
                  <p className="text-lg mb-4">{featuredHackathon.description}</p>
                  <div className="flex flex-wrap gap-4 items-center mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {formatDateRange(featuredHackathon.startDate, featuredHackathon.endDate)}
                    </span>
                    <span className="px-3 py-1 bg-green-500/90 rounded-full text-sm uppercase">
                      {featuredHackathon.status}
                    </span>
                  </div>
                  <Button className="w-full sm:w-auto" asChild>
                    <Link href={`/hackathons/${featuredHackathon.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Hackathons */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Hackathons</h2>
            <Button variant="outline" asChild>
              <Link href="/hackathons">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestHackathons.map((hackathon) => (
              <Card key={hackathon.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="h-48 relative">
                  {hackathon.banner ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${hackathon.banner})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 rounded-full text-white text-sm">
                    {hackathon.status}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {formatDateRange(hackathon.startDate, hackathon.endDate)}
                  </p>
                  <p className="text-gray-600 mb-4 line-clamp-2">{hackathon.description}</p>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/hackathons/${hackathon.id}`}>View Details</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Participate */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Participate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Connect with Peers</h3>
              <p className="text-gray-600">Build your network by collaborating with talented developers, designers, and innovators from around the world.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Learn New Skills</h3>
              <p className="text-gray-600">Accelerate your learning by building real-world projects and receiving feedback from industry experts.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Win Prizes</h3>
              <p className="text-gray-600">Compete for exciting prizes, mentorship opportunities, and the chance to bring your ideas to market.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-purple-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Build Something Amazing?</h2>
          <p className="text-lg mb-8">Join our community of innovators and start building the future today.</p>
          <Button className="bg-white text-purple-700 hover:bg-gray-100" size="lg" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
