"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { removeJudge } from '@/actions/judges';

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface JudgeWithUser {
  id: string;
  isAccepted: boolean;
  invitedAt: Date;
  acceptedAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

interface JudgeListProps {
  judges: JudgeWithUser[];
  hackathonId: string;
}

export function JudgeList({ judges, hackathonId }: JudgeListProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<JudgeWithUser | null>(null);

  // Handle removing a judge
  const handleRemoveClick = (judge: JudgeWithUser) => {
    setSelectedJudge(judge);
    setIsRemoving(true);
  };

  // Confirm removal
  const confirmRemove = async () => {
    if (!selectedJudge) return;
    
    try {
      const result = await removeJudge({
        judgeId: selectedJudge.id,
        hackathonId,
      });
      
      if (result.success) {
        setIsRemoving(false);
        router.refresh();
      } else {
        // Handle error (could use toast or other notification)
        console.error(result.error);
        router.push(`/hackathons/${hackathonId}/dashboard/judges?error=${encodeURIComponent(result.error || 'Failed to remove judge')}`);
      }
    } catch (error) {
      console.error('Error removing judge:', error);
      router.push(`/hackathons/${hackathonId}/dashboard/judges?error=${encodeURIComponent('Failed to remove judge')}`);
    }
  };

  if (judges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium">No Judges Invited</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          You haven't invited any judges yet. Invite judges to help evaluate submissions.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judge</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invited</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {judges.map((judge) => (
            <TableRow key={judge.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={judge.user.imageUrl || ''} alt={judge.user.name} />
                    <AvatarFallback>
                      {judge.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{judge.user.name}</div>
                    <div className="text-sm text-muted-foreground">{judge.user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {judge.isAccepted ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100">Pending</Badge>
                )}
              </TableCell>
              <TableCell>
                {formatDate(judge.invitedAt)}
                {judge.acceptedAt && (
                  <div className="text-xs text-muted-foreground">
                    Accepted: {formatDate(judge.acceptedAt)}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => handleRemoveClick(judge)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Remove Judge Dialog */}
      <Dialog open={isRemoving} onOpenChange={setIsRemoving}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Judge</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedJudge?.user.name} as a judge?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoving(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
            >
              Remove Judge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 