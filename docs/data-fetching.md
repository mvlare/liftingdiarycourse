# Data Fetching Standards

## Critical Rules

**ALL data fetching in this application MUST be done via React Server Components.**

This is non-negotiable. Do not use any of the following for data fetching:

- Route Handlers (`/api/*` routes)
- Client Components (`'use client'`)
- `useEffect` hooks
- Third-party data fetching libraries on the client
- Any other client-side data fetching mechanism

## Database Access

### Data Directory Structure

All database queries MUST be performed through helper functions located in the `/data` directory.

```
/data
  /workouts.ts      # Workout-related queries
  /exercises.ts     # Exercise-related queries
  /sets.ts          # Set-related queries
  /user.ts          # User-related queries
```

### Drizzle ORM

**All database queries MUST use Drizzle ORM. DO NOT USE RAW SQL.**

```typescript
// CORRECT - Using Drizzle ORM
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// INCORRECT - Raw SQL (NEVER DO THIS)
export async function getWorkouts(userId: string) {
  return db.execute(`SELECT * FROM workouts WHERE user_id = '${userId}'`);
}
```

## User Data Isolation

**CRITICAL SECURITY REQUIREMENT: A logged-in user can ONLY access their own data.**

Every single data helper function MUST:

1. Accept a `userId` parameter
2. Filter all queries by that `userId`
3. Never expose data belonging to other users

### Implementation Pattern

```typescript
// EVERY data function must follow this pattern
export async function getUserWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId)); // ALWAYS filter by userId
}

export async function getWorkoutById(userId: string, workoutId: string) {
  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ALWAYS include userId check
      )
    );
}
```

### What This Prevents

- Users accessing other users' workout data
- Users modifying other users' records
- Data leakage through API responses
- Privilege escalation attacks

## Server Component Data Fetching

### Correct Pattern

```typescript
// app/workouts/page.tsx
import { getWorkouts } from '@/data/workouts';
import { auth } from '@/lib/auth';

export default async function WorkoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Data fetching happens in the server component
  const workouts = await getWorkouts(session.user.id);

  return <WorkoutsList workouts={workouts} />;
}
```

### Incorrect Patterns (NEVER DO THESE)

```typescript
// WRONG - Client-side data fetching
'use client';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('/api/workouts').then(/* ... */); // NEVER DO THIS
  }, []);
}

// WRONG - Route handler
// app/api/workouts/route.ts
export async function GET() {
  // NEVER CREATE THESE FOR DATA FETCHING
}
```

## Summary

| Requirement | Rule |
|------------|------|
| Data fetching location | Server Components ONLY |
| Database queries | `/data` directory helper functions ONLY |
| ORM | Drizzle ORM ONLY (no raw SQL) |
| User isolation | ALWAYS filter by `userId` |
