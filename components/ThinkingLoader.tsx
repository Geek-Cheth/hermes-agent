'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeepOpenPrompt } from '@/components/KeepOpenPrompt';

interface ThinkingLoaderProps {
  message: string;
  label: string;
  logs?: string[];
}

export function ThinkingLoader({ message, label, logs = [] }: ThinkingLoaderProps) {
  const displayMessage = message.trim() || 'Working on it…';
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.07] bg-[#111111]/80 backdrop-blur-sm p-8">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="relative h-10 w-10 shrink-0"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute inset-0 rounded-full bg-white/5" />
            <motion.span
              className="absolute inset-1 rounded-full border-2 border-white/20 border-t-white/80"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="absolute inset-[14px] rounded-full bg-[#fafafa]/90" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#71717a]">
              {label}
            </p>
            <p className="text-sm text-[#a1a1aa]">StartupForge is thinking</p>
          </div>
        </div>

        <div className="min-h-[2rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayMessage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-lg font-medium text-shimmer"
            >
              {displayMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {logs.length > 0 && (
          <div
            ref={logsRef}
            className="mt-5 max-h-40 overflow-y-auto space-y-1 scrollbar-dark"
          >
            {logs.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 font-mono text-xs text-[#52525b]"
              >
                <span className="mt-0.5 shrink-0 text-[#3f3f46]">›</span>
                <span className={i === logs.length - 1 ? 'text-[#71717a]' : ''}>{line}</span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#52525b]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      <KeepOpenPrompt variant="running" />
    </div>
  );
}
