import { toast as showToast } from '@/lib/toast';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  return {
    toast: (options: ToastOptions) => {
      showToast(options);
    }
  };
}

export type { ToastOptions }; 