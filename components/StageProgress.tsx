'use client';

import { motion } from 'framer-motion';
import { TASK_LABELS, TASK_NAMES, TasksMap } from '@/lib/types';

interface StageProgressProps {
  tasks: TasksMap;
  currentStep: number;
  viewStep: number;
  onViewStepChange: (step: number) => void;
}

export function StageProgress({
  tasks,
  currentStep,
  viewStep,
  onViewStepChange,
}: StageProgressProps) {
  return (
    <div className="w-full">
      <div className="relative flex justify-between mb-2">
        {TASK_NAMES.map((task, index) => {
          const status = tasks[task];
          const isDone = status === 'done';
          const isActive = index === currentStep && status === 'active';
          const isCurrentView = index === viewStep;
          const canNavigate = index <= currentStep || isDone;
          const isLast = index === TASK_NAMES.length - 1;

          return (
            <button
              key={task}
              type="button"
              disabled={!canNavigate}
              onClick={() => canNavigate && onViewStepChange(index)}
              className={`relative flex flex-col items-center gap-2 flex-1 min-w-0 group ${
                canNavigate ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
              }`}
            >
              {!isLast && (
                <div
                  className="absolute top-5 left-1/2 z-0 h-0.5 w-full -translate-y-1/2 pointer-events-none"
                  aria-hidden
                >
                  <div className="h-full bg-white/[0.06]" />
                  {isDone && (
                    <motion.div
                      className="absolute inset-0 bg-[#fafafa] origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  )}
                </div>
              )}

              <motion.div
                layout
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? 'border-emerald-500/60 bg-[#0a1f17] text-emerald-400'
                    : isActive
                      ? 'border-white/40 bg-[#1a1a1a] text-[#fafafa]'
                      : 'border-[#404040] bg-[#111111] text-[#52525b]'
                } ${isCurrentView && canNavigate ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                animate={
                  isActive
                    ? {
                        boxShadow: [
                          '0 0 0 0 rgba(255,255,255,0)',
                          '0 0 0 8px rgba(255,255,255,0.06)',
                          '0 0 0 0 rgba(255,255,255,0)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              >
                {isDone ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-bold"
                  >
                    ✓
                  </motion.span>
                ) : isActive ? (
                  <motion.span
                    className="h-2 w-2 rounded-full bg-[#fafafa]"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={`relative z-10 text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[4.5rem] sm:max-w-none ${
                  isDone || isActive || isCurrentView
                    ? 'text-[#fafafa]'
                    : 'text-[#52525b]'
                }`}
              >
                {TASK_LABELS[task]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
