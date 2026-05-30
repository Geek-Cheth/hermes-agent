'use client';

import { motion } from 'framer-motion';

interface KeepOpenPromptProps {
  variant?: 'running' | 'queue';
}

export function KeepOpenPrompt({ variant = 'running' }: KeepOpenPromptProps) {
  const message =
    variant === 'queue'
      ? 'Keep this site open while we hold your place in the queue. If you leave, you may lose your spot and need to resume from History.'
      : 'Keep this site open while StartupForge works. Completed steps are saved, but the live task may need to be resumed from History if you leave.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3"
    >
      <motion.span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <p className="text-sm text-amber-200/90 leading-relaxed">{message}</p>
    </motion.div>
  );
}
