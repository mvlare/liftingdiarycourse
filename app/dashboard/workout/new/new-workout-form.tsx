"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { createWorkoutAction } from "./actions";

export function NewWorkoutForm() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!date) return;

    setIsSubmitting(true);

    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    await createWorkoutAction({
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
        {isSubmitting ? "Creating..." : "Create Workout"}
      </Button>
    </form>
  );
}
