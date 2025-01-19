import { env } from "@/env";
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: 'sk_test_3LTNGKDxXn20W7UtC0jTWpF32Tpw6Kte4oYn7du8cG'
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};