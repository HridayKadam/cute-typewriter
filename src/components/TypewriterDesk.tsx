"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Copy, Check, Volume2, VolumeX } from "lucide-react";
import { useTypewriterSound } from "@/hooks/useTypewriterSound";
import { countWords } from "@/lib/utils";

const DRAFT_KEY = "typewriter-draft";
const SOUND_KEY = "typewriter-sounds-on";

export function TypewriterDesk() {
  const [body, setBody] = useState("");
  const [soundsOn, setSoundsOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { playKey, playDing, playReturn } = useTypewriterSound(soundsOn);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    setBody(localStorage.getItem(DRAFT_KEY) ?? "");
    const savedSounds = localStorage.getItem(SOUND_KEY);
    if (savedSounds !== null) setSoundsOn(savedSounds === "true");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => localStorage.setItem(DRAFT_KEY, body), 400);
    return () => clearTimeout(t);
  }, [body, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem(SOUND_KEY, String(soundsOn));
  }, [soundsOn, mounted]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      playReturn();
      return;
    }
    if (e.key.length === 1 || e.key === "Backspace") {
      playKey();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      playKey();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const next = `${body.slice(0, start)}    ${body.slice(end)}`;
      setBody(next);
      requestAnimationFrame(() => {
        areaRef.current?.setSelectionRange(start + 4, start + 4);
      });
    }
  };

  const copyText = useCallback(async () => {
    const stamped = body.trim()
      ? `${body.trim()}\n\n— ${format(new Date(), "MMMM d, yyyy")}`
      : "";
    if (!stamped) return;
    await navigator.clipboard.writeText(stamped);
    playDing();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [body, playDing]);

  const clearSheet = () => {
    if (body && !window.confirm("Clear the sheet?")) return;
    setBody("");
    localStorage.removeItem(DRAFT_KEY);
    areaRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[720px]">
        {/* machine housing */}
        <div className="relative rounded-t-sm bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-900 px-4 pb-3 pt-5 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-x-8 top-3 h-1 rounded-full bg-neutral-600/50" />
          <div className="mx-auto mb-4 h-2 max-w-[200px] rounded-full bg-black/40" />

          {/* paper in platen */}
          <div className="relative mx-auto max-w-[620px] border-x-8 border-neutral-900 bg-neutral-950 px-1 pb-1 pt-2">
            <div
              className="typewriter-paper min-h-[min(52vh,420px)] px-8 pb-12 pt-10"
              onClick={() => areaRef.current?.focus()}
            >
              <textarea
                ref={areaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder=" "
                className="block w-full min-h-[min(44vh,360px)] resize-none border-0 bg-transparent font-typewriter text-[17px] leading-7 tracking-wide text-neutral-900 outline-none caret-neutral-900 placeholder:text-transparent"
                style={{ fontFamily: "var(--font-typewriter), 'Courier New', monospace" }}
              />
            </div>
          </div>

          {/* key row (visual) */}
          <div className="mx-auto mt-4 flex max-w-[540px] flex-wrap justify-center gap-[3px] opacity-90">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="h-[14px] w-[11px] rounded-[1px] border border-neutral-950 bg-gradient-to-b from-neutral-500 to-neutral-700 shadow-[0_2px_0_#0a0a0a]"
              />
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] uppercase tracking-[0.35em] text-neutral-500">
            royal standard · model 44
          </div>
        </div>

        {/* base */}
        <div className="h-3 rounded-b-md bg-neutral-950 shadow-inner" />

        {/* controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 pt-6">
          <p className="text-[11px] uppercase tracking-widest text-neutral-500">
            {countWords(body)} words · {body.length} chars
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="control-btn flex items-center gap-2"
              onClick={() => setSoundsOn((v) => !v)}
              aria-label={soundsOn ? "Mute" : "Sound on"}
            >
              {soundsOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              sound
            </button>
            <button type="button" className="control-btn" onClick={clearSheet}>
              clear
            </button>
            <button
              type="button"
              className="control-btn flex min-w-[120px] items-center justify-center gap-2 border-neutral-500 bg-neutral-200 text-neutral-900 hover:bg-white"
              onClick={() => void copyText()}
              disabled={!body.trim()}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "copied" : "copy"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-neutral-600">
          draft saved in this browser · copy to paste anywhere
        </p>
      </div>
    </div>
  );
}