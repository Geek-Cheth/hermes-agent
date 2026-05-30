import {
  Run,
  TASK_NAMES,
  TASK_TO_FIELD,
  TaskName,
  Phase,
} from './types';

export function taskOutputsFromRun(
  run: Run
): Partial<Record<TaskName, string>> {
  const outputs: Partial<Record<TaskName, string>> = {};
  for (const task of TASK_NAMES) {
    const field = TASK_TO_FIELD[task];
    const value = run[field];
    if (value) outputs[task] = value;
  }
  return outputs;
}

export type ResumeAction = 'run' | 'none' | 'redirect_results';

export interface ResumeState {
  phase: Phase;
  currentStep: number;
  viewStep: number;
  action: ResumeAction;
}

export function getResumeState(run: Run): ResumeState {
  if (run.status === 'complete' || run.status === 'error') {
    return {
      phase: run.status === 'complete' ? 'complete' : 'idle',
      currentStep: TASK_NAMES.length - 1,
      viewStep: TASK_NAMES.length - 1,
      action: 'redirect_results',
    };
  }

  const nextIndex = TASK_NAMES.findIndex((t) => run.tasks[t] !== 'done');

  if (nextIndex === -1) {
    return {
      phase: 'complete',
      currentStep: TASK_NAMES.length - 1,
      viewStep: TASK_NAMES.length - 1,
      action: 'none',
    };
  }

  const nextTask = TASK_NAMES[nextIndex];
  const taskStatus = run.tasks[nextTask];

  if (taskStatus === 'active') {
    return {
      phase: 'running',
      currentStep: nextIndex,
      viewStep: nextIndex,
      action: 'run',
    };
  }

  if (taskStatus === 'pending' && nextIndex > 0) {
    const prevTask = TASK_NAMES[nextIndex - 1];
    if (run.tasks[prevTask] === 'done') {
      return {
        phase: 'awaiting',
        currentStep: nextIndex - 1,
        viewStep: nextIndex - 1,
        action: 'none',
      };
    }
  }

  return {
    phase: 'running',
    currentStep: nextIndex,
    viewStep: nextIndex,
    action: 'run',
  };
}
