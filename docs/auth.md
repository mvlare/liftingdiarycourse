# Authentication Standards

## Authentication Provider

This project uses **Clerk** as the sole authentication provider. All authentication functionality must use Clerk.

## Rules

### 1. Only Use Clerk for Authentication

**ABSOLUTELY NO custom authentication should be implemented.** All authentication must be handled through Clerk.

- Use Clerk's pre-built components for sign-in, sign-up, and user management
- Use Clerk's server-side utilities for session validation
- Use Clerk's middleware for route protection

### 2. Getting the Current User

#### In Server Components

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

// Get just the userId (most common)
export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Use userId for data fetching
  const workouts = await getWorkouts(userId);
}

// Get full user object (when you need user details)
export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Access user.firstName, user.emailAddresses, etc.
}
```

#### In Client Components

```typescript
'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export function ClientComponent() {
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();

  if (!isLoaded) {
    return <Loading />;
  }

  // Use user data for display purposes only
  // NEVER fetch data in client components
}
```

### 3. Protecting Routes

#### Middleware Protection (Recommended)

Use Clerk's middleware to protect routes at the edge:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workouts(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### Page-Level Protection

For additional protection or custom redirect logic:

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Page content
}
```

### 4. Authentication UI Components

Use Clerk's pre-built components for all auth UI:

```typescript
import {
  SignIn,
  SignUp,
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';

// Sign-in page
export default function SignInPage() {
  return <SignIn />;
}

// Sign-up page
export default function SignUpPage() {
  return <SignUp />;
}

// Navigation with user button
export function Navigation() {
  return (
    <nav>
      <UserButton afterSignOutUrl="/" />
    </nav>
  );
}
```

### 5. Incorrect Patterns (NEVER DO THESE)

```typescript
// WRONG - Custom authentication logic
export async function login(email: string, password: string) {
  // NEVER implement custom auth
}

// WRONG - Manual JWT handling
const token = cookies().get('auth-token');
const user = verifyToken(token); // NEVER DO THIS

// WRONG - Custom session storage
const session = await getSession(); // NEVER use custom sessions

// WRONG - Storing passwords
const hashedPassword = await bcrypt.hash(password, 10); // NEVER store passwords
```

### 6. Environment Variables

Clerk requires these environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 7. User ID in Data Operations

**CRITICAL:** The `userId` from Clerk MUST be used for all data operations:

```typescript
import { auth } from '@clerk/nextjs/server';
import { getWorkouts } from '@/data/workouts';

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Pass Clerk's userId to data functions
  const workouts = await getWorkouts(userId);

  return <WorkoutsList workouts={workouts} />;
}
```

## Summary

| Requirement | Rule |
|------------|------|
| Auth provider | Clerk ONLY |
| User identification | `auth()` or `currentUser()` from `@clerk/nextjs/server` |
| Route protection | Clerk middleware + page-level checks |
| Auth UI | Clerk pre-built components ONLY |
| Session management | Handled by Clerk (never custom) |
| User data access | Always use Clerk's `userId` |

## Rationale

- **Security**: Clerk handles security best practices (CSRF, XSS, secure cookies)
- **Simplicity**: No custom auth code to maintain or audit
- **Features**: Built-in MFA, social logins, and user management
- **Compliance**: Clerk handles data protection requirements
- **Integration**: Seamless integration with Next.js App Router
