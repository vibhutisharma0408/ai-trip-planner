"use client";

import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      fallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
