"use client";

import { useCallback, useRef, useEffect } from "react";

export function useTypewriterSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const resume = () => {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      void ctxRef.current.resume();
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [enabled]);

  const playKey = useCallback(() => {
    if (!enabled) return;
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    void ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    noise.buffer = buffer;

    filter.type = "bandpass";
    filter.frequency.value = 900 + Math.random() * 400;
    filter.Q.value = 0.8;

    osc.type = "square";
    osc.frequency.setValueAtTime(180 + Math.random() * 60, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.03);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
    noise.start(t);
    noise.stop(t + 0.04);

    // Carriage return / deeper thud on space
    if (Math.random() > 0.92) {
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = "sine";
      bell.frequency.setValueAtTime(520, t);
      bellGain.gain.setValueAtTime(0.04, t);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(t);
      bell.stop(t + 0.08);
    }
  }, [enabled]);

  const playDing = useCallback(() => {
    if (!enabled) return;
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }, [enabled]);

  return { playKey, playDing };
}