"use client";

import { type ReactNode, useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  useEffect(() => {
    // Suppress Clerk network errors in console that don't affect functionality
    if (typeof window !== "undefined") {
      const originalError = console.error;
      const originalWarn = console.warn;

      console.error = (...args: any[]) => {
        const errorMessage = String(args[0] || "");
        // Ignore Clerk network disconnection errors
        if (
          errorMessage.includes("ERR_INTERNET_DISCONNECTED") ||
          errorMessage.includes("net::ERR_INTERNET_DISCONNECTED") ||
          (errorMessage.includes("clerk.accounts.dev") && 
           (errorMessage.includes("sessions") || errorMessage.includes("tokens")))
        ) {
          return; // Suppress these errors silently
        }
        originalError.apply(console, args);
      };

      console.warn = (...args: any[]) => {
        const warnMessage = String(args[0] || "");
        // Ignore Clerk development keys warning if needed
        if (warnMessage.includes("Clerk has been loaded with development keys")) {
          return; // Suppress this warning
        }
        originalWarn.apply(console, args);
      };

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
