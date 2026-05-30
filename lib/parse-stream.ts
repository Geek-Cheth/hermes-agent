import { SENTINELS } from './hermes';
import { normalizeMarkdown } from './normalize-markdown';
import { OutputField, SseEvent, TaskName } from './types';

function normalizeOutputForField(field: OutputField, content: string): string {
  if (field === 'landing_html') return content;
  return normalizeMarkdown(content);
}

const TASK_DONE_RE =
  /TASK_DONE:\s*(competitor_research|landing_page|launch_posts|agent_prompts)/g;

const SENTINEL_TO_FIELD: Record<string, OutputField> = {
  [SENTINELS.competitors]: 'competitors_md',
  [SENTINELS.landing]: 'landing_html',
  [SENTINELS.posts]: 'posts_md',
  [SENTINELS.agentPrompts]: 'agent_prompts_md',
};

const FIELD_TO_SENTINEL: Record<OutputField, string> = {
  competitors_md: SENTINELS.competitors,
  landing_html: SENTINELS.landing,
  posts_md: SENTINELS.posts,
  agent_prompts_md: SENTINELS.agentPrompts,
};

const TASK_TO_OUTPUT_FIELD: Record<TaskName, OutputField> = {
  competitor_research: 'competitors_md',
  landing_page: 'landing_html',
  launch_posts: 'posts_md',
  agent_prompts: 'agent_prompts_md',
};

const SENTINEL_ORDER = [
  SENTINELS.competitors,
  SENTINELS.landing,
  SENTINELS.posts,
  SENTINELS.agentPrompts,
] as const;

const ALL_SENTINELS = Object.values(SENTINELS);

let debugLineCount = 0;

function getStreamDebugLimit(): number | null {
  const raw = process.env.STREAM_DEBUG_LIMIT?.trim();
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function streamDebug(label: string, payload: string) {
  if (process.env.STREAM_DEBUG !== '1') return;

  const limit = getStreamDebugLimit();
  if (limit !== null && debugLineCount >= limit) return;

  debugLineCount++;
  const fullBody = process.env.STREAM_DEBUG_FULL === '1';
  const body = fullBody
    ? payload
    : payload.length > 500
      ? payload.slice(0, 500) + '…'
      : payload;

  console.log(`[stream-debug ${debugLineCount}] ${label}:`, body);
}

function stripSentinelsForDisplay(text: string): string {
  let out = text;
  for (const s of ALL_SENTINELS) {
    out = out.split(s).join('');
  }
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

export interface StreamChunk {
  rawText: string;
  visibleText: string;
  events: SseEvent[];
}

export function extractStreamParts(line: string): {
  rawText: string;
  visibleText: string;
} | null {
  if (!line.startsWith('data: ')) return null;
  const payload = line.slice(6).trim();
  if (!payload || payload === '[DONE]') return null;

  streamDebug('raw', payload);

  try {
    const json = JSON.parse(payload) as Record<string, unknown>;
    const parts: string[] = [];

    const choice = (json.choices as Array<Record<string, unknown>>)?.[0];
    const delta = choice?.delta as Record<string, unknown> | undefined;
    const message = choice?.message as Record<string, unknown> | undefined;

    if (typeof delta?.content === 'string') parts.push(delta.content);
    if (typeof delta?.reasoning_content === 'string') {
      parts.push(delta.reasoning_content);
    }
    if (typeof message?.content === 'string') parts.push(message.content);
    if (typeof json.content === 'string') parts.push(json.content);
    if (typeof json.text === 'string') parts.push(json.text);

    // Tool calls are not surfaced in visible stream (shown via curated status on client)

    if (typeof json.event === 'string' && json.event !== 'ping') {
      parts.push(`[${json.event}]\n`);
    }

    const rawText = parts.join('');
    if (!rawText) return null;

    const visibleText = stripSentinelsForDisplay(rawText);
    return { rawText, visibleText };
  } catch {
    return null;
  }
}

export function extractSentinelOutput(
  buffer: string,
  field: OutputField
): string | null {
  const sentinel = FIELD_TO_SENTINEL[field];
  const firstIdx = buffer.indexOf(sentinel);
  if (firstIdx === -1) return null;
  const secondIdx = buffer.indexOf(sentinel, firstIdx + sentinel.length);
  if (secondIdx === -1) return null;
  const raw = buffer.slice(firstIdx + sentinel.length, secondIdx).trim();
  if (!raw) return null;
  return normalizeOutputForField(field, raw);
}

export class StreamParser {
  private buffer = '';
  private seenTasks = new Set<TaskName>();
  private seenFields = new Set<OutputField>();

  get accumulated(): string {
    return this.buffer;
  }

  hasTaskDone(task: TaskName): boolean {
    return this.seenTasks.has(task);
  }

  hasOutput(field: OutputField): boolean {
    return this.seenFields.has(field);
  }

  processChunk(rawText: string): SseEvent[] {
    this.buffer += rawText;
    const events: SseEvent[] = [];

    const taskRe = new RegExp(TASK_DONE_RE.source, 'g');
    let match: RegExpExecArray | null;
    while ((match = taskRe.exec(this.buffer)) !== null) {
      const taskName = match[1] as TaskName;
      if (!this.seenTasks.has(taskName)) {
        this.seenTasks.add(taskName);
        events.push({ type: 'task_done', task: taskName });
      }
    }

    for (const sentinel of SENTINEL_ORDER) {
      const field = SENTINEL_TO_FIELD[sentinel];
      if (this.seenFields.has(field)) continue;

      const content = extractSentinelOutput(this.buffer, field);
      if (content) {
        this.seenFields.add(field);
        events.push({ type: 'output', field, message: content });
      }
    }

    return events;
  }

  finalizeForTask(task: TaskName): {
    output: string | null;
    events: SseEvent[];
  } {
    const events: SseEvent[] = [];
    const field = TASK_TO_OUTPUT_FIELD[task];

    if (!this.seenFields.has(field)) {
      const fromSentinel = extractSentinelOutput(this.buffer, field);
      if (fromSentinel) {
        this.seenFields.add(field);
        events.push({ type: 'output', field, message: fromSentinel });
        return { output: fromSentinel, events };
      }
    }

    const substantial = this.buffer.replace(/\s/g, '').length > 200;

    if (!this.seenTasks.has(task) && substantial) {
      const fallback = normalizeOutputForField(field, this.buffer.trim());
      this.seenFields.add(field);
      events.push({ type: 'output', field, message: fallback });
      this.seenTasks.add(task);
      events.push({ type: 'task_done', task });
      return { output: fallback, events };
    }

    if (this.seenTasks.has(task) && !this.seenFields.has(field) && substantial) {
      const fallback = normalizeOutputForField(field, this.buffer.trim());
      this.seenFields.add(field);
      events.push({ type: 'output', field, message: fallback });
      return { output: fallback, events };
    }

    return { output: null, events };
  }
}

export async function* parseHermesStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<StreamChunk> {
  debugLineCount = 0;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = new StreamParser();
  let lineBuffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      lineBuffer += decoder.decode(value, { stream: true });
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() ?? '';

      for (const line of lines) {
        const parts = extractStreamParts(line);
        if (!parts) continue;

        const events = parser.processChunk(parts.rawText);
        yield {
          rawText: parts.rawText,
          visibleText: parts.visibleText,
          events,
        };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
