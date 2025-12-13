import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/"
]);

export default clerkMiddleware(async (auth, req) => {
  const response = NextResponse.next();
  
  // Get user ID and add to headers for server components to avoid calling auth() in pages
  const { userId } = await auth();
  
  if (!isPublicRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  if (userId) {
    response.headers.set("x-clerk-user-id", userId);
  }
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
};
