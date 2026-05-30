/**
 * In-process concurrency gate for Hermes task execution.
 * Correct for single-container deployment (npm start / one autopilot-app).
 * For horizontal scaling, replace with a shared store (Redis / Supabase counter).
 */

export const MAX_CONCURRENT = 10;

export class QueueAbortedError extends Error {
  constructor() {
    super('Queue wait aborted');
    this.name = 'QueueAbortedError';
  }
}

interface Waiter {
  resolve: (slot: JobSlot) => void;
  reject: (err: Error) => void;
  onPosition: (position: number) => void;
  abortHandler: () => void;
}

export interface JobSlot {
  release: () => void;
}

let active = 0;
const waiters: Waiter[] = [];

function notifyWaiters() {
  waiters.forEach((waiter, index) => {
    waiter.onPosition(index + 1);
  });
}

function removeWaiter(waiter: Waiter) {
  const index = waiters.indexOf(waiter);
  if (index === -1) return;
  waiters.splice(index, 1);
  notifyWaiters();
}

function grantNextWaiter() {
  const next = waiters.shift();
  if (!next) return;
  active++;
  next.resolve({ release: createRelease() });
  notifyWaiters();
}

function createRelease(): () => void {
  let released = false;
  return () => {
    if (released) return;
    released = true;
    active = Math.max(0, active - 1);
    grantNextWaiter();
  };
}

export function acquireSlot(
  signal?: AbortSignal,
  onPosition?: (position: number) => void
): Promise<JobSlot> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new QueueAbortedError());
      return;
    }

    const positionCallback = onPosition ?? (() => {});

    if (active < MAX_CONCURRENT) {
      active++;
      resolve({ release: createRelease() });
      return;
    }

    const waiter: Waiter = {
      resolve,
      reject,
      onPosition: positionCallback,
      abortHandler: () => {
        removeWaiter(waiter);
        reject(new QueueAbortedError());
      },
    };

    waiters.push(waiter);
    positionCallback(waiters.length);

    if (signal) {
      signal.addEventListener('abort', waiter.abortHandler, { once: true });
    }
  });
}

export function getQueueStats() {
  return {
    active,
    waiting: waiters.length,
    maxConcurrent: MAX_CONCURRENT,
  };
}
