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
      className="flex items-start gap-3 border-l-2 border-white/[0.12] pl-3 py-0.5"
    >
      <motion.span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <p className="text-xs text-[#71717a] leading-relaxed">{message}</p>
    </motion.div>
  );
}
