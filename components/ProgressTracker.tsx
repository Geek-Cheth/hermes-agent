'use client';

import { TASK_LABELS, TASK_NAMES, TaskName, TasksMap } from '@/lib/types';

interface ProgressTrackerProps {
  tasks: TasksMap;
  activeTask?: TaskName | null;
}

export function ProgressTracker({ tasks, activeTask }: ProgressTrackerProps) {
  return (
    <div className="space-y-2">
      {TASK_NAMES.map((task) => {
        const status = tasks[task] ?? 'pending';
        const isActive = activeTask === task || status === 'active';
        const isDone = status === 'done';

        return (
          <div
            key={task}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
              isActive
                ? 'border-sky-500/50 bg-sky-950/20'
                : 'border-white/[0.07] bg-[#111111]'
            }`}
          >
            <span
              className={`text-xl ${
                isDone
                  ? 'text-emerald-400'
                  : isActive
                    ? 'text-sky-400 animate-pulse'
                    : 'text-[#404040]'
              }`}
            >
              {isDone ? '✓' : isActive ? '◉' : '○'}
            </span>
            <span
              className={`font-medium ${
                isDone ? 'text-[#fafafa]' : isActive ? 'text-sky-300' : 'text-[#71717a]'
              }`}
            >
              {TASK_LABELS[task]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
