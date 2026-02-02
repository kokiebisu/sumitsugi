'use client';

import { type ReactNode } from 'react';

export function ClientOnly({ children }: { children: ReactNode }) {
  // Only render on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  return <>{children}</>;
}
