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

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

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

  const playReturn = useCallback(() => {
    if (!enabled) return;
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    void ctx.resume();
    const t = ctx.currentTime;

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "triangle";
    thud.frequency.setValueAtTime(120, t);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    thudGain.gain.setValueAtTime(0.35, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(t);
    thud.stop(t + 0.12);

    const clack = ctx.createOscillator();
    const clackGain = ctx.createGain();
    clack.type = "square";
    clack.frequency.setValueAtTime(400, t + 0.02);
    clack.frequency.exponentialRampToValueAtTime(90, t + 0.06);
    clackGain.gain.setValueAtTime(0.08, t + 0.02);
    clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    clack.connect(clackGain);
    clackGain.connect(ctx.destination);
    clack.start(t + 0.02);
    clack.stop(t + 0.08);
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

  return { playKey, playDing, playReturn };
}