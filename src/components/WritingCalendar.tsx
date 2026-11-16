"use client";

import { useEffect, useState } from "react";
import { MOODS } from "@/lib/content";
import { cn } from "@/lib/utils";
import { entryDatesInMonth, listMoods } from "@/lib/storage";

type Props = {
  variant?: "writing" | "mood";
  className?: string;
};

export function WritingCalendar({ variant = "writing", className }: Props) {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth());
  const [writtenDays, setWrittenDays] = useState<number[]>([]);
  const [moods, setMoods] = useState<Record<number, string>>({});

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  useEffect(() => {
    if (variant === "writing") {
      setWrittenDays(entryDatesInMonth(year, month));
    } else {
      const map: Record<number, string> = {};
      for (const m of listMoods(year, month)) {
        const day = new Date(m.logged_at).getDate();
        map[day] = m.mood;
      }
      setMoods(map);
    }
  }, [variant, year, month]);

  const moodColor = (id: string) => MOODS.find((m) => m.id === id)?.color ?? "#f4c4c8";

  return (
    <div className={cn("card-cozy", className)}>
      <h3 className="mb-3 font-script text-2xl text-vintage-brown">
        {variant === "writing" ? "days you wrote" : "mood calendar"}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-vintage-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="text-[10px]">
            {d[0]}
          </span>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => (
          <span key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const wrote = writtenDays.includes(day);
          const mood = moods[day];
          const isToday = day === now.getDate();
          return (
            <div
              key={day}
              className={cn(
                "flex h-8 items-center justify-center rounded-full font-serif text-vintage-ink",
                isToday && "ring-1 ring-blush-400",
                variant === "writing" && wrote && "bg-blush-300/70",
                variant === "mood" && mood && "text-[10px]",
              )}
              style={variant === "mood" && mood ? { backgroundColor: `${moodColor(mood)}88` } : undefined}
              title={variant === "mood" && mood ? mood : wrote ? "wrote" : undefined}
            >
              {variant === "mood" && mood ? (MOODS.find((m) => m.id === mood)?.emoji ?? day) : day}
            </div>
          );
        })}
      </div>
    </div>
  );
}