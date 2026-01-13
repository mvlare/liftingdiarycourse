"use server";

import { createWorkout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createWorkoutSchema = z.object({
  name: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export async function createWorkoutAction(params: {
  name?: string;
  date: string;
}) {
  const validated = createWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const workout = await createWorkout(userId, validated);
  revalidatePath("/dashboard");
  return workout;
}
