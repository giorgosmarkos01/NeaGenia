import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // run middleware for all pages except static files and Next internals
    "/((?!.+\\.[\\w]+$|_next).*)",
    // always run for API routes
    "/(api|trpc)(.*)",
  ],
};
