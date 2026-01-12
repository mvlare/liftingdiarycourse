"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";

interface DateNavigationProps {
  currentDate: Date;
}

export function DateNavigation({ currentDate }: DateNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleDateChange(date: Date | undefined) {
    if (!date) return;

    const params = new URLSearchParams(searchParams.toString());
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    params.set("date", dateString);
    router.push(`/dashboard?${params.toString()}`);
  }

  return <DatePicker date={currentDate} onDateChange={handleDateChange} />;
}
