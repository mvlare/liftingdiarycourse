# Routing Standards

This document defines the routing standards for the lifting diary application.

## Route Structure

**ALL application routes MUST be accessed through `/dashboard`.** The dashboard serves as the authenticated entry point for all user-facing features.

### Route Hierarchy

```
/                    # Public landing page (unauthenticated)
/dashboard           # Main dashboard (protected)
/dashboard/*         # All sub-routes (protected)
```

## Route Protection

**ALL `/dashboard` routes MUST be protected and accessible only to logged-in users.** Route protection is handled through Next.js middleware using Clerk.

### Middleware Configuration

Route protection is configured in `middleware.ts` at the project root:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

## Guidelines

### DO

- Place all authenticated features under `/dashboard`
- Use Next.js middleware for route protection
- Use Clerk's `createRouteMatcher` for defining protected routes
- Use `auth.protect()` to enforce authentication

### DO NOT

- Create authenticated routes outside of `/dashboard`
- Implement custom route protection logic
- Use client-side route guards as the primary protection mechanism
- Bypass middleware for authentication checks

## Adding New Routes

When adding new features:

1. Create the route under `app/dashboard/`
2. The middleware automatically protects it (no additional configuration needed)
3. Use `auth()` from `@clerk/nextjs/server` to get user information in Server Components
