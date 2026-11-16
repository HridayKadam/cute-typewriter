"use client";

import { MOODS } from "@/lib/content";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (mood: string) => void;
  className?: string;
};

export function MoodPicker({ value, onChange, className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {MOODS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
            value === m.id
              ? "scale-105 border-vintage-brown/30 shadow-sm"
              : "border-transparent bg-white/50 hover:border-blush-300",
          )}
          style={value === m.id ? { backgroundColor: `${m.color}55` } : undefined}
        >
          <span>{m.emoji}</span>
          <span className="font-serif text-vintage-brown">{m.label}</span>
        </button>
      ))}
    </div>
  );
}