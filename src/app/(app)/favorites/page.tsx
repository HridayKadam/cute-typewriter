"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { JournalEntry, Memory } from "@/lib/types";
import { listFavorites } from "@/lib/storage";

export default function FavoritesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    const { entries: e, memories: m } = listFavorites();
    setEntries(e);
    setMemories(m);
  }, []);

  return (
    <div>
      <h1 className="mb-2 font-script text-4xl text-vintage-brown">my favorites</h1>
      <p className="mb-8 font-serif text-vintage-muted">the entries and moments you held closest</p>

      {entries.length === 0 && memories.length === 0 ? (
        <p className="text-center font-script text-2xl text-vintage-muted">
          tap the little heart while writing to bookmark something precious ♡
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 font-serif text-xl">entries</h2>
            <ul className="space-y-3">
              {entries.map((e) => (
                <li key={e.id}>
                  <Link href={`/write?id=${e.id}`} className="card-cozy block">
                    <span className="text-blush-500">♡</span> {e.title || "untitled"}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 font-serif text-xl">memories</h2>
            <ul className="space-y-3">
              {memories.map((m) => (
                <li key={m.id} className="card-cozy">
                  <span className="text-blush-500">♡</span> {m.title}
                  <p className="mt-1 font-typewriter text-sm text-vintage-muted">{m.caption}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}