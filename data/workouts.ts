import { db } from "@/lib/db";
import { workouts, workoutExercises, exercises, sets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(
  userId: string,
  data: { name?: string; date: string }
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

export async function getWorkoutById(userId: string, workoutId: number) {
  const [workout] = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      date: workouts.date,
    })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout || null;
}

export async function updateWorkout(
  userId: string,
  workoutId: number,
  data: { name?: string; date: string }
) {
  const [workout] = await db
    .update(workouts)
    .set({
      name: data.name,
      date: data.date,
      updatedAt: new Date(),
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout;
}

export async function getWorkoutsByDate(userId: string, date: string) {
  const userWorkouts = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      date: workouts.date,
    })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)));

  const workoutsWithExercises = await Promise.all(
    userWorkouts.map(async (workout) => {
      const workoutExerciseRows = await db
        .select({
          id: workoutExercises.id,
          order: workoutExercises.order,
          exerciseId: workoutExercises.exerciseId,
          exerciseName: exercises.name,
        })
        .from(workoutExercises)
        .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
        .where(eq(workoutExercises.workoutId, workout.id))
        .orderBy(workoutExercises.order);

      const exercisesWithSets = await Promise.all(
        workoutExerciseRows.map(async (we) => {
          const exerciseSets = await db
            .select({
              id: sets.id,
              setNumber: sets.setNumber,
              weight: sets.weight,
              reps: sets.reps,
            })
            .from(sets)
            .where(eq(sets.workoutExerciseId, we.id))
            .orderBy(sets.setNumber);

          return {
            id: we.id,
            name: we.exerciseName,
            sets: exerciseSets.map((s) => ({
              weight: Number(s.weight),
              reps: s.reps,
            })),
          };
        })
      );

      return {
        ...workout,
        exercises: exercisesWithSets,
      };
    })
  );

  return workoutsWithExercises;
}
