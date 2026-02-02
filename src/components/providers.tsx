'use client';

import { AuthProvider } from '@/contexts/auth-context';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, render children without AuthProvider
  if (!isClient) {
    return <>{children}</>;
  }

  // On client, wrap with AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}
