"use client";

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';

type LevelUpModalProps = {
  open: boolean;
  level: number;
  title: string;
  onClose: () => void;
};

export default function LevelUpModal({ open, level, title, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (!open) return;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Level Up</p>
            <h2 className="mt-2 text-2xl font-semibold">Level {level}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{title}</p>
            <p className="mt-3 text-sm text-foreground/80">
              You unlocked new momentum. Keep the streak alive.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Keep going
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
