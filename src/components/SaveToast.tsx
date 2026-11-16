"use client";

import { AnimatePresence, motion } from "framer-motion";

export function SaveToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-blush-300 bg-ivory/95 px-5 py-2 font-script text-xl text-vintage-brown shadow-paper backdrop-blur"
        >
          your little thought is safe ♡
        </motion.div>
      )}
    </AnimatePresence>
  );
}