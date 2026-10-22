'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export function ErrorAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-red-400 hover:text-red-600" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Success message that hides itself after a few seconds */
export function SuccessAlert({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;
  return (
    <div role="status" className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  );
}
