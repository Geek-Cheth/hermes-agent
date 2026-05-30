import { SseEvent } from './types';

export function formatSseEvent(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
