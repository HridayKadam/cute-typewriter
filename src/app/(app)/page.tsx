"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";
import { promptForDate, quoteForDate, MOODS } from "@/lib/content";
import { TypewriterIllustration } from "@/components/TypewriterIllustration";
import { WritingCalendar } from "@/components/WritingCalendar";
import { FloralDecor } from "@/components/FloralDecor";
import { getProfile, listEntries, listMemories } from "@/lib/storage";
import type { JournalEntry, Memory } from "@/lib/types";

export default function HomePage() {
  const today = new Date();
  const [nickname, setNickname] = useState("lovely");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    setNickname(getProfile().nickname);
    setEntries(listEntries(5));
    setMemories(listMemories());
  }, []);

  const prompt = promptForDate(today);
  const quote = quoteForDate(today);

  return (
    <div className="relative">
      <FloralDecor className="absolute -right-4 top-0 hidden md:block" />
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="font-script text-4xl text-vintage-brown md:text-5xl">
            hello, {nickname} <span className="text-blush-500">♡</span>
          </p>
          <p className="mt-2 font-serif text-lg text-vintage-muted">{formatDateLong(today)}</p>
          <TypewriterIllustration className="my-8" />
          <Link href="/write" className="btn-vintage text-2xl">
            start writing
          </Link>
        </div>

        <div className="space-y-4">
          <div className="card-cozy">
            <h3 className="font-script text-2xl text-vintage-brown">today&apos;s prompt</h3>
            <p className="mt-2 font-typewriter text-vintage-ink">{prompt}</p>
          </div>
          <div className="card-cozy border-l-4 border-blush-300">
            <p className="font-serif italic text-vintage-ink">&ldquo;{quote.text}&rdquo;</p>
            <p className="mt-2 font-script text-lg text-vintage-muted">— {quote.author}</p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-script text-3xl text-vintage-brown">recent entries</h2>
          {entries.length === 0 ? (
            <p className="font-serif text-vintage-muted">
              no pages yet — your first entry is waiting on a fresh sheet of paper ♡
            </p>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => (
                <li key={e.id}>
                  <Link href={`/write?id=${e.id}`} className="card-cozy flex items-start justify-between gap-3 hover:border-blush-300">
                    <div>
                      <h3 className="font-serif text-lg">{e.title || "untitled thought"}</h3>
                      <p className="line-clamp-2 font-typewriter text-sm text-vintage-muted">{e.body}</p>
                    </div>
                    {e.mood && <span title={e.mood}>{MOODS.find((m) => m.id === e.mood)?.emoji}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <WritingCalendar variant="writing" />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-script text-3xl text-vintage-brown">little memories</h2>
        {memories.length === 0 ? (
          <p className="font-serif text-vintage-muted">
            <Link href="/moments" className="underline decoration-blush-300">
              save your first photo memory
            </Link>
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {memories.slice(0, 6).map((m) => (
              <div key={m.id} className="card-cozy min-w-[200px] shrink-0">
                <p className="font-serif">{m.title}</p>
                <p className="mt-1 line-clamp-2 font-typewriter text-xs text-vintage-muted">{m.caption}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}