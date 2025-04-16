/**
 * Toast notification utility
 */

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Show a toast notification
 */
export function toast(options: ToastOptions) {
  // This is a client-side only function
  if (typeof window === 'undefined') return;

  // Create custom event to be caught by the Toast component
  const event = new CustomEvent('toast', { 
    detail: options 
  });
  
  // Dispatch the event
  window.dispatchEvent(event);
} 