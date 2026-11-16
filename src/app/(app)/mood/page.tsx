"use client";

import { useEffect, useState } from "react";
import { WritingCalendar } from "@/components/WritingCalendar";
import { MOODS } from "@/lib/content";
import { listMoods } from "@/lib/storage";

export default function MoodPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const d = new Date();
    const moods = listMoods(d.getFullYear(), d.getMonth());
    const c: Record<string, number> = {};
    for (const m of moods) c[m.mood] = (c[m.mood] ?? 0) + 1;
    setCounts(c);
  }, []);

  const max = Math.max(1, ...Object.values(counts), 1);

  return (
    <div>
      <h1 className="mb-2 font-script text-4xl text-vintage-brown">mood tracker</h1>
      <p className="mb-8 font-serif text-vintage-muted">a soft map of how your heart has been feeling</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <WritingCalendar variant="mood" />
        <div className="card-cozy">
          <h3 className="mb-4 font-script text-2xl text-vintage-brown">this month</h3>
          <ul className="space-y-3">
            {MOODS.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <span>{m.emoji}</span>
                <span className="flex-1 font-serif">{m.label}</span>
                <MoodBar count={counts[m.id] ?? 0} color={m.color} max={max} />
                <span className="w-6 text-right text-sm text-vintage-muted">{counts[m.id] ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-typewriter text-sm text-vintage-muted">
            choose your mood while writing — it paints this calendar for you.
          </p>
        </div>
      </div>
    </div>
  );
}

function MoodBar({ count, color, max }: { count: number; color: string; max: number }) {
  const width = `${Math.round((count / max) * 100)}%`;
  return (
    <div className="h-2 w-24 overflow-hidden rounded-full bg-cream-dark">
      <div className="h-full rounded-full transition-all" style={{ width, backgroundColor: color }} />
    </div>
  );
}