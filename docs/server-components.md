# Server Components Standards

## Critical Rules

**This is a Next.js 15+ project.** Server Components have specific requirements that MUST be followed.

## Async Params and SearchParams

**In Next.js 15, `params` and `searchParams` are Promises and MUST be awaited.**

This is a breaking change from Next.js 14. Accessing params without awaiting will cause runtime errors.

### Correct Pattern

```typescript
// app/dashboard/workout/[workoutId]/page.tsx

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { workoutId } = await params; // MUST await params

  // Now you can use workoutId
  const workoutIdNum = parseInt(workoutId, 10);
  // ...
}
```

### With SearchParams

```typescript
// app/dashboard/page.tsx

type SearchParams = Promise<{ date?: string }>;

export default async function DashboardPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const { date } = await searchParams; // MUST await searchParams

  // Now you can use date
  const selectedDate = date || getTodayString();
  // ...
}
```

### Incorrect Patterns (NEVER DO THESE)

```typescript
// WRONG - Not awaiting params (will cause runtime errors)
export default async function Page({ params }: { params: { workoutId: string } }) {
  const id = params.workoutId; // ERROR: params is a Promise
}

// WRONG - Destructuring directly (will cause runtime errors)
export default async function Page({ params: { workoutId } }) {
  // ERROR: Cannot destructure a Promise
}

// WRONG - Synchronous component with params
export default function Page({ params }) {
  // ERROR: Must be async to await params
}
```

## Type Definitions

Always define explicit types for params and searchParams:

```typescript
// Single param
type Params = Promise<{ id: string }>;

// Multiple params
type Params = Promise<{ categoryId: string; productId: string }>;

// SearchParams (all values are strings or undefined)
type SearchParams = Promise<{
  page?: string;
  sort?: string;
  filter?: string;
}>;

// Combined
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  // ...
}
```

## Server Component Structure

All page Server Components should follow this structure:

```typescript
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getData } from "@/data/resource";

type Params = Promise<{ resourceId: string }>;

export default async function ResourcePage({ params }: { params: Params }) {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // 2. Await and validate params
  const { resourceId } = await params;
  const resourceIdNum = parseInt(resourceId, 10);
  if (isNaN(resourceIdNum)) {
    notFound();
  }

  // 3. Fetch data (user-scoped)
  const resource = await getData(userId, resourceIdNum);
  if (!resource) {
    notFound();
  }

  // 4. Render
  return (
    <main>
      {/* ... */}
    </main>
  );
}
```

## Summary

| Requirement | Rule |
|------------|------|
| `params` access | MUST be awaited (it's a Promise) |
| `searchParams` access | MUST be awaited (it's a Promise) |
| Component type | MUST be `async` to await params |
| Type definitions | MUST wrap param types in `Promise<>` |
| Validation | Validate param values after awaiting |
