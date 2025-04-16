'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { PrizeForm } from './PrizeForm';
import { Prize } from '@/db/schema';

interface EditPrizeDialogProps {
  prize: Prize;
  hackathonId: string;
}

export function EditPrizeDialog({ prize, hackathonId }: EditPrizeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="p-1 text-gray-500 hover:text-purple-600">
          <Edit size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Prize</DialogTitle>
          <DialogDescription>
            Update the details for this prize.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <PrizeForm 
            hackathonId={hackathonId} 
            prize={prize} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 