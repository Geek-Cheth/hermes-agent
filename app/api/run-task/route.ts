import { auth } from '@clerk/nextjs/server';
import { buildPromptForTask, runTask } from '@/lib/hermes';
import { acquireSlot, QueueAbortedError } from '@/lib/job-queue';
import { ENFORCE_MONTHLY_LIMIT, MONTHLY_RUN_LIMIT } from '@/lib/limits';
import { normalizeMarkdown } from '@/lib/normalize-markdown';
import { parseHermesStream, StreamParser } from '@/lib/parse-stream';
import { formatSseEvent } from '@/lib/sse';
import { nextStatusMessage } from '@/lib/status-messages';
import {
  completeRun,
  countRunsThisMonth,
  createRun,
  failRun,
  getRun,
  getRunForUser,
  saveRunOutput,
  updateRunTask,
} from '@/lib/supabase';
import {
  extractTelegramSummary,
  sendTelegramFallback,
} from '@/lib/telegram';
import { TASK_TO_FIELD, TASK_NAMES, TaskName, SseEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function isValidTask(task: string | null): task is TaskName {
  return TASK_NAMES.includes(task as TaskName);
}

function sendStatus(
  send: (event: SseEvent) => void,
  message: string,
  task: TaskName
) {
  send({ type: 'status', message, task });
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idea = searchParams.get('idea');
  const runId = searchParams.get('runId');
  const task = searchParams.get('task');

  if (!idea?.trim() || !runId || !isValidTask(task)) {
    return new Response('Missing idea, runId, or valid task', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SseEvent) => {
        try {
          controller.enqueue(encoder.encode(formatSseEvent(event)));
        } catch {
          // Client disconnected; keep processing and persisting to Supabase.
        }
      };

      let accumulated = '';
      let sawVisibleText = false;
      let sawOutput = false;
      let sawTaskDone = false;
      let streamEnded = false;
      let heartbeatIndex = 0;
      let slot: { release: () => void } | null = null;
      let isQueued = false;
      let queueHeartbeat: ReturnType<typeof setInterval> | null = null;
      let currentQueuePosition = 0;

      const heartbeat = setInterval(() => {
        if (streamEnded || isQueued) return;
        sendStatus(send, nextStatusMessage(task, heartbeatIndex), task);
        heartbeatIndex++;
      }, 5000);

      const noOutputTimer = setTimeout(() => {
        if (!sawVisibleText && !streamEnded && !isQueued) {
          sendStatus(
            send,
            'Still working — running tools in the background…',
            task
          );
        }
      }, 20000);

      try {
        let run = await getRunForUser(runId, userId);
        if (!run) {
          const existing = await getRun(runId);
          if (existing) {
            send({ type: 'error', message: 'Forbidden' });
            return;
          }

          if (ENFORCE_MONTHLY_LIMIT) {
            const monthlyCount = await countRunsThisMonth(userId);
            if (monthlyCount >= MONTHLY_RUN_LIMIT) {
              send({
                type: 'error',
                message: `Monthly run limit reached (${MONTHLY_RUN_LIMIT}). Try again next month.`,
              });
              return;
            }
          }

          run = await createRun(runId, idea.trim(), userId);
        }

        isQueued = true;
        queueHeartbeat = setInterval(() => {
          if (currentQueuePosition > 0) {
            send({ type: 'queued', position: currentQueuePosition, task });
          }
        }, 5000);

        slot = await acquireSlot(request.signal, (position) => {
          currentQueuePosition = position;
          send({ type: 'queued', position, task });
        });
        isQueued = false;

        if (queueHeartbeat) {
          clearInterval(queueHeartbeat);
          queueHeartbeat = null;
        }

        await updateRunTask(runId, task, 'active');
        sendStatus(send, `Starting ${task.replace(/_/g, ' ')}…`, task);
        sendStatus(send, 'Connecting…', task);

        const context = {
          competitorsMd: run.competitors_md ?? undefined,
        };

        const prompt = buildPromptForTask(task, idea.trim(), runId, context);
        const hermesResponse = await runTask(prompt, runId, request.signal);

        if (!hermesResponse.body) {
          throw new Error('The AI service returned no response.');
        }

        sendStatus(send, nextStatusMessage(task, 0), task);

        let progressLineBuffer = '';

        for await (const chunk of parseHermesStream(hermesResponse.body)) {
          accumulated += chunk.rawText;

          if (chunk.visibleText.trim().length > 0) {
            sawVisibleText = true;
            send({ type: 'delta', content: chunk.visibleText, task });

            progressLineBuffer += chunk.visibleText;
            const nlIdx = progressLineBuffer.lastIndexOf('\n');
            if (nlIdx !== -1) {
              const completeLines = progressLineBuffer.slice(0, nlIdx);
              progressLineBuffer = progressLineBuffer.slice(nlIdx + 1);
              for (const line of completeLines.split('\n')) {
                const trimmed = line.trim();
                if (trimmed.startsWith('PROGRESS:')) {
                  const msg = trimmed.slice(9).trim();
                  if (msg) send({ type: 'status', message: msg, task, log: true });
                }
              }
            }
          }

          for (const event of chunk.events) {
            if (event.type === 'task_done' && event.task) {
              sawTaskDone = true;
              await updateRunTask(runId, event.task, 'done');
              send(event);
            } else if (
              event.type === 'output' &&
              event.field &&
              event.message
            ) {
              sawOutput = true;
              await saveRunOutput(runId, event.field, event.message);
              send(event);
            }
          }
        }

        const endParser = new StreamParser();
        endParser.processChunk(accumulated);
        const final = endParser.finalizeForTask(task);
        for (const event of final.events) {
          if (event.type === 'output' && event.field && event.message) {
            sawOutput = true;
            await saveRunOutput(runId, event.field, event.message);
            send(event);
          }
          if (event.type === 'task_done' && event.task) {
            sawTaskDone = true;
            await updateRunTask(runId, event.task, 'done');
            send(event);
          }
        }

        if (!sawOutput && !sawTaskDone) {
          const field = TASK_TO_FIELD[task];
          const substantial = accumulated.replace(/\s/g, '').length > 200;
          if (substantial) {
            const fallback =
              field === 'landing_html'
                ? accumulated.trim()
                : normalizeMarkdown(accumulated.trim());
            await saveRunOutput(runId, field, fallback);
            await updateRunTask(runId, task, 'done');
            sawOutput = true;
            sawTaskDone = true;
            send({ type: 'output', field, message: fallback });
            send({ type: 'task_done', task });
          }
        }

        if (!sawOutput && !sawTaskDone) {
          throw new Error(
            'The AI service finished without usable output. Please try again.'
          );
        }

        if (task === 'agent_prompts') {
          const summary = extractTelegramSummary(accumulated);
          if (summary) await sendTelegramFallback(summary);
        }

        const isLastTask = task === 'agent_prompts';
        if (isLastTask) {
          const completed = await completeRun(runId);
          send({ type: 'complete', run: completed });
        } else {
          send({ type: 'status', message: 'awaiting_approval', task });
        }
      } catch (err) {
        if (err instanceof QueueAbortedError) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Task run failed';

        const isAbort =
          err instanceof Error &&
          (err.name === 'AbortError' || message.includes('aborted'));

        if (!isAbort) {
          try {
            await failRun(runId, message);
          } catch {
            // ignore
          }
          send({ type: 'error', message });
        }
      } finally {
        streamEnded = true;
        if (queueHeartbeat) clearInterval(queueHeartbeat);
        clearInterval(heartbeat);
        clearTimeout(noOutputTimer);
        slot?.release();
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
