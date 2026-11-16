"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Volume2, VolumeX, Heart, Trash2 } from "lucide-react";
import { MoodPicker } from "@/components/MoodPicker";
import { SaveToast } from "@/components/SaveToast";
import { useTypewriterSound } from "@/hooks/useTypewriterSound";
import { cn, countWords } from "@/lib/utils";
import type { JournalEntry, Profile } from "@/lib/types";
import { motion } from "framer-motion";

type Props = {
  initialEntry?: JournalEntry | null;
  profile?: Profile | null;
};

export function TypewriterEditor({ initialEntry, profile }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id") ?? initialEntry?.id;

  const [id, setId] = useState<string | undefined>(entryId ?? undefined);
  const [title, setTitle] = useState(initialEntry?.title ?? "");
  const [body, setBody] = useState(initialEntry?.body ?? "");
  const [mood, setMood] = useState<string | null>(initialEntry?.mood ?? null);
  const [favorite, setFavorite] = useState(initialEntry?.is_favorite ?? false);
  const [soundsOn, setSoundsOn] = useState(profile?.typewriter_sounds ?? true);
  const [savedToast, setSavedToast] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const { playKey, playDing } = useTypewriterSound(soundsOn);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paperClass =
    profile?.paper_style === "rose"
      ? "paper-sheet paper-sheet--rose"
      : profile?.paper_style === "parchment"
        ? "paper-sheet paper-sheet--parchment"
        : "paper-sheet";

  const fontClass =
    profile?.typewriter_font === "courier"
      ? "font-mono"
      : profile?.typewriter_font === "serif"
        ? "font-serif"
        : "font-typewriter";

  const persist = useCallback(
    async (showConfirm = false) => {
      setStatus("saving");
      const res = await fetch(id ? `/api/entries/${id}` : "/api/entries", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, body, mood }),
      });
      const entry = (await res.json()) as JournalEntry;
      if (!id) setId(entry.id);
      setStatus("saved");
      if (showConfirm) {
        setSavedToast(true);
        playDing();
        window.setTimeout(() => setSavedToast(false), 2200);
      }
      window.setTimeout(() => setStatus("idle"), 1500);
    },
    [id, title, body, mood, playDing],
  );

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (body.trim() || title.trim()) void persist(false);
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, body, mood, persist]);

  useEffect(() => {
    if (!entryId) return;
    void (async () => {
      const res = await fetch(`/api/entries/${entryId}`);
      if (!res.ok) return;
      const entry = (await res.json()) as JournalEntry;
      setId(entry.id);
      setTitle(entry.title);
      setBody(entry.body);
      setMood(entry.mood);
      setFavorite(entry.is_favorite);
    })();
  }, [entryId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
      playKey();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 8 }}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <motion.div
          className="inline-block rounded-lg bg-vintage-brown px-6 py-3 shadow-typewriter"
          whileHover={{ scale: 1.01 }}
        >
          <div className="h-2 w-40 rounded bg-vintage-muted/40" />
          <div className="mt-2 flex gap-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-3 w-3 rounded-sm bg-vintage-muted/60" />
            ))}
          </div>
        </motion.div>
        <div className="text-right font-serif text-sm text-vintage-muted">
          <div>{format(new Date(), "EEEE, MMMM d, yyyy")}</div>
          <div>{format(new Date(), "h:mm a")}</div>
        </div>
      </div>

      <div className={cn(paperClass, "min-h-[520px] p-6 md:p-10")}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="title of this little moment..."
          className={cn(
            "mb-4 w-full border-0 border-b border-vintage-brown/15 bg-transparent text-2xl text-vintage-ink outline-none placeholder:text-vintage-muted/50",
            fontClass,
          )}
        />

        <MoodPicker value={mood} onChange={setMood} className="mb-6" />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="begin typing your heart out..."
          className={cn(
            "min-h-[360px] w-full resize-none border-0 bg-transparent text-lg leading-10 text-vintage-ink outline-none caret-vintage-brown placeholder:text-vintage-muted/40",
            fontClass,
          )}
          spellCheck
        />

        <motion.div
          className="inline-block h-5 w-0.5 bg-vintage-brown align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-serif text-sm text-vintage-muted">
          {countWords(body)} words · {body.length} characters
          {status === "saving" && <span className="ml-2 text-blush-500">saving…</span>}
          {status === "saved" && <span className="ml-2 text-blush-500">saved ♡</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label={soundsOn ? "Mute typewriter sounds" : "Enable typewriter sounds"}
            className="rounded-full border border-vintage-brown/15 p-2 hover:bg-blush-100"
            onClick={() => setSoundsOn((v) => !v)}
          >
            {soundsOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className={cn("rounded-full border border-vintage-brown/15 p-2", favorite && "animate-heartbeat text-blush-500")}
            onClick={async () => {
              if (!id) await persist(false);
              const next = !favorite;
              setFavorite(next);
              if (id) {
                await fetch(`/api/entries/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ is_favorite: next }),
                });
              }
            }}
          >
            <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} />
          </button>
          {id && (
            <button
              type="button"
              className="rounded-full border border-vintage-brown/15 p-2 text-red-800/70 hover:bg-red-50"
              onClick={async () => {
                if (!confirm("delete this entry?")) return;
                await fetch(`/api/entries/${id}`, { method: "DELETE" });
                router.push("/journal");
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button type="button" className="btn-vintage text-lg" onClick={() => void persist(true)}>
            save ♡
          </button>
        </div>
      </div>
      <SaveToast show={savedToast} />
    </motion.div>
  );
}