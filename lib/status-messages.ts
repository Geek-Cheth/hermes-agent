import { TaskName } from './types';

export const TASK_STATUS_MESSAGES: Record<TaskName, string[]> = {
  competitor_research: [
    'Searching the web…',
    'Reading competitor sites…',
    'Comparing pricing and features…',
    'Building your research brief…',
  ],
  landing_page: [
    'Designing the layout…',
    'Writing the copy…',
    'Generating HTML…',
    'Polishing the waitlist form…',
  ],
  launch_posts: [
    'Drafting the X thread…',
    'Writing the Show HN post…',
    'Polishing the Reddit post…',
    'Packaging launch copy…',
  ],
  agent_prompts: [
    'Mapping the business plan…',
    'Choosing the tech stack…',
    'Writing build prompts for your AI agents…',
    'Finalizing handoff prompts…',
  ],
};

export function nextStatusMessage(task: TaskName, index: number): string {
  const messages = TASK_STATUS_MESSAGES[task];
  return messages[index % messages.length];
}
