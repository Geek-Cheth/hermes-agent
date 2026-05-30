import { getRun } from '@/lib/supabase';
import { formatSseEvent } from '@/lib/sse';
import { SseEvent, TaskName } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const runId = params.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SseEvent) => {
        controller.enqueue(encoder.encode(formatSseEvent(event)));
      };

      try {
        const run = await getRun(runId);
        if (!run) {
          send({ type: 'error', message: 'Run not found' });
          controller.close();
          return;
        }

        send({ type: 'status', run });

        for (const [task, status] of Object.entries(run.tasks)) {
          if (status === 'done') {
            send({ type: 'task_done', task: task as TaskName });
          }
        }

        if (run.competitors_md) {
          send({ type: 'output', field: 'competitors_md' });
        }
        if (run.landing_html) {
          send({ type: 'output', field: 'landing_html' });
        }
        if (run.posts_md) {
          send({ type: 'output', field: 'posts_md' });
        }
        if (run.agent_prompts_md) {
          send({ type: 'output', field: 'agent_prompts_md' });
        }

        if (run.status === 'complete') {
          send({ type: 'complete', run });
        } else if (run.status === 'error') {
          send({ type: 'error', message: run.error_message ?? 'Run failed' });
        }

        if (run.status === 'running') {
          const poll = setInterval(async () => {
            const updated = await getRun(runId);
            if (!updated) {
              clearInterval(poll);
              return;
            }

            for (const [task, status] of Object.entries(updated.tasks)) {
              if (status === 'done') {
                send({ type: 'task_done', task: task as TaskName });
              }
            }

            if (updated.status === 'complete') {
              send({ type: 'complete', run: updated });
              clearInterval(poll);
              controller.close();
            } else if (updated.status === 'error') {
              send({
                type: 'error',
                message: updated.error_message ?? 'Run failed',
              });
              clearInterval(poll);
              controller.close();
            }
          }, 3000);

          // Stop polling after 10 minutes
          setTimeout(() => clearInterval(poll), 600_000);
          return;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Status check failed';
        send({ type: 'error', message });
      }

      controller.close();
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
