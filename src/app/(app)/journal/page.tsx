"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MOODS } from "@/lib/content";
import { listEntries } from "@/lib/storage";
import type { JournalEntry } from "@/lib/types";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  useEffect(() => setEntries(listEntries(200)), []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-script text-4xl text-vintage-brown">my journal</h1>
          <p className="font-serif text-vintage-muted">every page, in the order life wrote them</p>
        </div>
        <Link href="/write" className="btn-vintage">
          new entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-center font-script text-3xl text-vintage-muted">
          your story starts with one keystroke — begin writing ♡
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/write?id=${e.id}`}
                className="card-cozy block transition hover:-translate-y-0.5 hover:border-blush-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif text-xl text-vintage-ink">{e.title || "untitled"}</h2>
                  <span className="font-serif text-xs text-vintage-muted">
                    {format(new Date(e.written_at), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 font-typewriter text-sm text-vintage-muted">{e.body}</p>
                {e.mood && (
                  <span className="mt-2 inline-block text-sm">
                    {MOODS.find((m) => m.id === e.mood)?.emoji} {e.mood}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}