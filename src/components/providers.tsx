"use client";

import { AuthProvider } from "@/contexts/auth-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  // Always render with AuthProvider to maintain consistent DOM structure
  // AuthProvider is already SSR-safe with typeof window checks
  return <AuthProvider>{children}</AuthProvider>;
}
