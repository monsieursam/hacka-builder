"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface InviteLinkDisplayProps {
  inviteLink: string;
}

export function InviteLinkDisplay({ inviteLink }: InviteLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error('Failed to copy link to clipboard');
    }
  };

  return (
    <div className="relative">
      <div className="border rounded-md p-2 pr-24 bg-muted text-sm font-mono truncate">
        {inviteLink}
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        className="absolute right-1 top-1"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
} 