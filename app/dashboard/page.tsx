import { redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutsByDate } from "@/data/workouts";
import { DateNavigation } from "./date-navigation";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const params = await searchParams;
  const dateParam = params.date;

  // Parse date consistently to avoid timezone issues
  // When no param, use today's date in local timezone
  let dateString: string;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    dateString = dateParam;
  } else {
    const now = new Date();
    dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  // Create date at noon to avoid timezone edge cases
  const date = new Date(`${dateString}T12:00:00`);

  const workouts = await getWorkoutsByDate(userId, dateString);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Workout Log</h1>

      <div className="mb-8">
        <DateNavigation currentDate={date} />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id}>
                {workout.name && (
                  <h3 className="font-medium mb-2">{workout.name}</h3>
                )}
                <div className="space-y-4">
                  {workout.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="border rounded-lg p-4 bg-card text-card-foreground"
                    >
                      <h4 className="font-medium mb-3">{exercise.name}</h4>
                      <div className="space-y-2">
                        {exercise.sets.map((set, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 text-sm text-muted-foreground"
                          >
                            <span className="w-16">Set {index + 1}</span>
                            <span className="w-20">{set.weight} lbs</span>
                            <span>{set.reps} reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
