'use client';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePrize } from '@/actions/prizes';

interface DeletePrizeButtonProps {
  prizeId: string;
}

export function DeletePrizeButton({ prizeId }: DeletePrizeButtonProps) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this prize?")) {
      const result = await deletePrize(prizeId);
      if (result.success) {
        toast.success("Prize deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete prize");
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-1 text-gray-500 hover:text-red-600"
    >
      <Trash2 size={16} />
    </button>
  );
} 