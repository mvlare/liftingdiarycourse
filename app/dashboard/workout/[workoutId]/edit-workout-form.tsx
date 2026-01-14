"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { updateWorkoutAction } from "./actions";

type Workout = {
  id: number;
  name: string | null;
  date: string;
};

export function EditWorkoutForm({ workout }: { workout: Workout }) {
  const router = useRouter();
  const [year, month, day] = workout.date.split("-").map(Number);
  const initialDate = new Date(year, month - 1, day);

  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [name, setName] = useState(workout.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!date) return;

    setIsSubmitting(true);

    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    await updateWorkoutAction({
      workoutId: workout.id,
      name: name || undefined,
      date: dateString,
    });

    router.push(`/dashboard?date=${dateString}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name (optional)</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Upper Body, Leg Day"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <DatePicker date={date} onDateChange={setDate} />
      </div>

      <Button type="submit" disabled={!date || isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
