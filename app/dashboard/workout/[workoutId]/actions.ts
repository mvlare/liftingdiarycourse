"use server";

import { updateWorkout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateWorkoutSchema = z.object({
  workoutId: z.number(),
  name: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name?: string;
  date: string;
}) {
  const validated = updateWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const workout = await updateWorkout(userId, validated.workoutId, {
    name: validated.name,
    date: validated.date,
  });

  revalidatePath("/dashboard");
  return workout;
}
