"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Bench Press",
    sets: [
      { weight: 135, reps: 10 },
      { weight: 155, reps: 8 },
      { weight: 175, reps: 6 },
    ],
  },
  {
    id: "2",
    name: "Incline Dumbbell Press",
    sets: [
      { weight: 50, reps: 12 },
      { weight: 55, reps: 10 },
      { weight: 60, reps: 8 },
    ],
  },
  {
    id: "3",
    name: "Cable Flyes",
    sets: [
      { weight: 25, reps: 15 },
      { weight: 30, reps: 12 },
      { weight: 30, reps: 12 },
    ],
  },
]

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Workout Log</h1>

      <div className="mb-8">
        <DatePicker date={date} onDateChange={setDate} />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Workouts for {date ? format(date, "do MMM yyyy") : "selected date"}
        </h2>

        {mockWorkouts.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="space-y-4">
            {mockWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="border rounded-lg p-4 bg-card text-card-foreground"
              >
                <h3 className="font-medium mb-3">{workout.name}</h3>
                <div className="space-y-2">
                  {workout.sets.map((set, index) => (
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
        )}
      </section>
    </main>
  )
}
