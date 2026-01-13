import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Workout</h1>
      <NewWorkoutForm />
    </main>
  );
}
