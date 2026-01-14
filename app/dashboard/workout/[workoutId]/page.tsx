import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId, 10);

  if (isNaN(workoutIdNum)) {
    notFound();
  }

  const workout = await getWorkoutById(userId, workoutIdNum);

  if (!workout) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
    </main>
  );
}
