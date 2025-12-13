import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Trip Planner",
  description: "Plan smarter trips with AI-crafted itineraries"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Clerk network errors and prevent page crashes
              if (typeof window !== 'undefined') {
                // Suppress console errors
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = String(args[0] || '');
                  if (msg.includes('ERR_INTERNET_DISCONNECTED') || 
                      (msg.includes('clerk.accounts.dev') && (msg.includes('sessions') || msg.includes('tokens')))) {
                    return; // Suppress Clerk network errors silently
                  }
                  originalError.apply(console, args);
                };
                
                // Prevent unhandled rejections from crashing the page
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason?.message || String(event.reason || '');
                  const url = event.reason?.url || '';
                  if (reason.includes('ERR_INTERNET_DISCONNECTED') || 
                      reason.includes('Failed to fetch') ||
                      url.includes('clerk.accounts.dev')) {
                    event.preventDefault(); // Prevent page crash
                    return false;
                  }
                });
                
                // Also catch general errors
                window.addEventListener('error', function(event) {
                  const msg = event.message || '';
                  if (msg.includes('ERR_INTERNET_DISCONNECTED') || 
                      msg.includes('clerk.accounts.dev')) {
                    event.preventDefault();
                    return false;
                  }
                });
              }
            `
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

