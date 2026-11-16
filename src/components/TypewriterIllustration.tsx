"use client";

import { motion } from "framer-motion";

export function TypewriterIllustration({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.svg
        viewBox="0 0 320 200"
        className="mx-auto w-full max-w-md drop-shadow-typewriter"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="40" y="120" width="240" height="56" rx="8" fill="#6b5344" />
        <rect x="48" y="128" width="224" height="40" rx="4" fill="#3d3229" />
        <rect x="60" y="88" width="200" height="36" rx="2" fill="#e8dfd2" stroke="#8b7355" />
        <text x="70" y="110" fontFamily="monospace" fontSize="14" fill="#6b5344">
          dear diary ♡
        </text>
        <motion.rect
          x="175"
          y="98"
          width="2"
          height="18"
          fill="#6b5344"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {[...Array(36)].map((_, i) => (
          <rect
            key={i}
            x={52 + (i % 18) * 12}
            y={138 + Math.floor(i / 18) * 10}
            width="8"
            height="8"
            rx="1"
            fill="#8b7355"
          />
        ))}
        <ellipse cx="160" cy="168" rx="100" ry="12" fill="rgba(61,50,41,0.15)" />
        <path d="M130 72h60v8H130z" fill="#8b7355" />
        <circle cx="260" cy="132" r="6" fill="#f4c4c8" />
      </motion.svg>
      <div className="absolute -right-2 top-4 text-lg opacity-60">✦</div>
      <div className="absolute -left-1 bottom-8 text-sm opacity-50">♡</div>
    </motion.div>
  );
}