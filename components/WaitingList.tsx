'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { KeepOpenPrompt } from '@/components/KeepOpenPrompt';

interface WaitingListProps {
  position: number;
  label?: string;
}

export function WaitingList({ position, label }: WaitingListProps) {
  const displayPosition = Math.max(1, position);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-sky-900/50 bg-gradient-to-br from-[#0c1220] via-[#111111] to-[#0a0f18] p-8">
        <motion.div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl"
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-6 h-20 w-20">
            <motion.span
              className="absolute inset-0 rounded-full border border-sky-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.span
              className="absolute inset-2 rounded-full border border-dashed border-sky-400/40"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={displayPosition}
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-sky-300 tabular-nums"
                >
                  #{displayPosition}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-sky-400/80 mb-2">
            Launch queue
          </p>
          <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
            You&apos;re in the waiting line
          </h3>
          <p className="text-sm text-[#a1a1aa] max-w-sm mb-1">
            All agent slots are busy right now. We&apos;ll start your{' '}
            {label ? label.toLowerCase() : 'task'} automatically when a spot
            opens.
          </p>
          <p className="text-xs text-[#71717a]">
            {displayPosition === 1
              ? 'You are next in line.'
              : `${displayPosition - 1} ${displayPosition - 1 === 1 ? 'person' : 'people'} ahead of you.`}
          </p>

          <div className="mt-6 flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-6 rounded-full bg-sky-500/40"
                animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <KeepOpenPrompt variant="queue" />
    </div>
  );
}
