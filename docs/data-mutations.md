# Data Mutation Standards

## Critical Rules

**ALL data mutations in this application MUST be done via Server Actions.**

This is non-negotiable. Do not use any of the following for data mutations:

- Route Handlers (`/api/*` routes)
- Client-side `fetch` calls
- Direct database calls in components
- Any other client-side mutation mechanism

## Server Actions

### File Structure

**All server actions MUST be colocated with their corresponding page in files named `actions.ts`.**

```
/app
  /workouts
    /page.tsx           # Page component
    /actions.ts         # Server actions for this page
  /workouts/[id]
    /page.tsx           # Page component
    /actions.ts         # Server actions for this page
```

### Server Action Definition

```typescript
// app/workouts/actions.ts
'use server';

import { createWorkout } from '@/data/workouts';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  // 1. Validate with Zod
  const validated = createWorkoutSchema.parse(params);

  // 2. Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 3. Call data helper function
  return createWorkout(session.user.id, validated);
}
```

## Parameter Typing

### Required: Typed Parameters

**All server action parameters MUST be explicitly typed. DO NOT use `FormData`.**

```typescript
// CORRECT - Typed parameters
export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
  date: Date;
}) {
  // ...
}

// CORRECT - Using a type alias
type UpdateWorkoutParams = {
  workoutId: string;
  name: string;
  date: Date;
};

export async function updateWorkoutAction(params: UpdateWorkoutParams) {
  // ...
}
```

### Forbidden: FormData

```typescript
// INCORRECT - Never use FormData (NEVER DO THIS)
export async function updateWorkoutAction(formData: FormData) {
  const name = formData.get('name'); // NO!
  // ...
}
```

### Why No FormData?

- Type safety is lost with `FormData`
- Validation becomes more complex
- Refactoring is error-prone
- IDE support is diminished

## Zod Validation

### Required: Validate All Parameters

**ALL server actions MUST validate their parameters using Zod.**

```typescript
// CORRECT - Full validation pattern
import { z } from 'zod';

const createExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive().optional(),
});

type CreateExerciseParams = z.infer<typeof createExerciseSchema>;

export async function createExerciseAction(params: CreateExerciseParams) {
  const validated = createExerciseSchema.parse(params);
  // Continue with validated data...
}
```

### Incorrect Patterns

```typescript
// INCORRECT - No validation (NEVER DO THIS)
export async function createExerciseAction(params: {
  workoutId: string;
  name: string;
}) {
  // Directly using params without validation is forbidden!
  return createExercise(userId, params);
}
```

## Data Helper Functions

### Data Directory Structure

All database mutations MUST be performed through helper functions located in the `/data` directory.

```
/data
  /workouts.ts      # Workout mutations (create, update, delete)
  /exercises.ts     # Exercise mutations
  /sets.ts          # Set mutations
  /user.ts          # User mutations
```

### Drizzle ORM

**All database mutations MUST use Drizzle ORM. DO NOT USE RAW SQL.**

```typescript
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// CORRECT - Using Drizzle ORM
export async function createWorkout(
  userId: string,
  data: { name: string; date: Date }
) {
  return db.insert(workouts).values({
    userId,
    name: data.name,
    date: data.date,
  });
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string; date: Date }
) {
  return db
    .update(workouts)
    .set({ name: data.name, date: data.date })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// INCORRECT - Raw SQL (NEVER DO THIS)
export async function createWorkout(userId: string, data: { name: string }) {
  return db.execute(
    `INSERT INTO workouts (user_id, name) VALUES ('${userId}', '${data.name}')`
  );
}
```

## User Data Isolation

**CRITICAL SECURITY REQUIREMENT: A logged-in user can ONLY mutate their own data.**

Every single data mutation helper function MUST:

1. Accept a `userId` parameter
2. Filter all mutations by that `userId`
3. Never allow modification of data belonging to other users

```typescript
// EVERY mutation function must follow this pattern
export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string }
) {
  return db
    .update(workouts)
    .set(data)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ALWAYS include userId check
      )
    );
}
```

## No Redirects in Server Actions

**Server actions MUST NOT use `redirect()`. All redirects should be handled client-side after the server action resolves.**

### Why No Server-Side Redirects?

- Server-side redirects throw exceptions, making error handling unpredictable
- Client-side redirects give you control over loading states and error handling
- The client can decide where to redirect based on the action result

### Incorrect Pattern

```typescript
// INCORRECT - Never redirect in server actions (NEVER DO THIS)
'use server';

import { redirect } from 'next/navigation';

export async function createWorkoutAction(params: { name: string; date: string }) {
  // ... validation and mutation
  await createWorkout(userId, validated);
  redirect('/workouts'); // NO! Don't do this
}
```

### Correct Pattern

```typescript
// CORRECT - Server action returns data, no redirect
'use server';

export async function createWorkoutAction(params: { name: string; date: string }) {
  // ... validation and mutation
  const workout = await createWorkout(userId, validated);
  revalidatePath('/workouts');
  return workout; // Return data instead of redirecting
}
```

```typescript
// CORRECT - Client handles the redirect
'use client';

import { useRouter } from 'next/navigation';

function CreateWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(data: FormData) {
    const workout = await createWorkoutAction({ name, date });
    router.push('/workouts'); // Redirect on the client
  }
}
```

## Complete Example

### Server Action File

```typescript
// app/workouts/actions.ts
'use server';

import { createWorkout, updateWorkout, deleteWorkout } from '@/data/workouts';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schemas
const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date: z.coerce.date(),
});

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

// Actions
export async function createWorkoutAction(params: {
  name: string;
  date: Date;
}) {
  const validated = createWorkoutSchema.parse(params);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const workout = await createWorkout(session.user.id, validated);
  revalidatePath('/workouts');
  return workout;
}

export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
  date: Date;
}) {
  const validated = updateWorkoutSchema.parse(params);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const workout = await updateWorkout(
    session.user.id,
    validated.workoutId,
    validated
  );
  revalidatePath('/workouts');
  return workout;
}

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const validated = deleteWorkoutSchema.parse(params);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await deleteWorkout(session.user.id, validated.workoutId);
  revalidatePath('/workouts');
}
```

### Data Helper File

```typescript
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(
  userId: string,
  data: { name: string; date: Date }
) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name,
      date: data.date,
    })
    .returning();

  return workout;
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string; date: Date }
) {
  const [workout] = await db
    .update(workouts)
    .set({ name: data.name, date: data.date })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Summary

| Requirement | Rule |
|------------|------|
| Mutation mechanism | Server Actions ONLY |
| Action file location | Colocated `actions.ts` files |
| Parameter typing | Explicit types (NO `FormData`) |
| Validation | Zod validation REQUIRED |
| Database mutations | `/data` directory helper functions ONLY |
| ORM | Drizzle ORM ONLY (no raw SQL) |
| User isolation | ALWAYS filter by `userId` |
| Redirects | Client-side ONLY (no `redirect()` in actions) |
