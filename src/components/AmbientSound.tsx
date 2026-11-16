"use client";

import { useEffect, useRef } from "react";

const SOUNDS: Record<string, { freq: number; label: string }> = {
  none: { freq: 0, label: "off" },
  rain: { freq: 180, label: "rain" },
  fireplace: { freq: 90, label: "fireplace" },
  cafe: { freq: 220, label: "café hum" },
};

export function AmbientSound({ sound = "none" }: { sound?: string | null }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    nodesRef.current.forEach((n) => n.stop());
    nodesRef.current = [];
    if (!sound || sound === "none") return;

    const cfg = SOUNDS[sound] ?? SOUNDS.rain;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    gain.connect(ctx.destination);

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = cfg.freq + i * 40 + Math.random() * 20;
      osc.connect(gain);
      osc.start();
      nodesRef.current.push(osc);
    }

    return () => {
      nodesRef.current.forEach((n) => n.stop());
      void ctx.close();
    };
  }, [sound]);

  return null;
}