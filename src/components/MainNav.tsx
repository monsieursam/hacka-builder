'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function MainNav() {
  const pathname = usePathname();
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">HackaBuilder</Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/hackathons" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith('/hackathons') ? 'text-purple-600' : 'text-muted-foreground'
              }`}
            >
              Hackathons
            </Link>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/dashboard') ? 'text-purple-600' : 'text-muted-foreground'
                }`}
              >
                My Dashboard
              </Link>
            </SignedIn>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
} 