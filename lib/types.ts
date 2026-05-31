export type TaskName =
  | 'competitor_research'
  | 'landing_page'
  | 'launch_posts'
  | 'agent_prompts';

export type TaskStatus = 'pending' | 'active' | 'done';

export type RunStatus = 'running' | 'complete' | 'error';

export type TasksMap = Record<TaskName, TaskStatus>;

export interface Run {
  id: string;
  user_id: string | null;
  idea: string;
  status: RunStatus;
  tasks: TasksMap;
  competitors_md: string | null;
  landing_html: string | null;
  posts_md: string | null;
  agent_prompts_md: string | null;
  landing_template: string | null;
  landing_style_notes: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export type OutputField =
  | 'competitors_md'
  | 'landing_html'
  | 'posts_md'
  | 'agent_prompts_md';

export const TASK_NAMES: TaskName[] = [
  'competitor_research',
  'landing_page',
  'launch_posts',
  'agent_prompts',
];

export const DEFAULT_TASKS: TasksMap = {
  competitor_research: 'pending',
  landing_page: 'pending',
  launch_posts: 'pending',
  agent_prompts: 'pending',
};

export const TASK_TO_FIELD: Record<TaskName, OutputField> = {
  competitor_research: 'competitors_md',
  landing_page: 'landing_html',
  launch_posts: 'posts_md',
  agent_prompts: 'agent_prompts_md',
};

export const TASK_LABELS: Record<TaskName, string> = {
  competitor_research: 'Competitor Research',
  landing_page: 'Landing Page',
  launch_posts: 'Launch Posts',
  agent_prompts: 'AI Agent Prompts',
};

export const PROCEED_LABELS: Record<TaskName, string> = {
  competitor_research: 'Proceed to Landing Page',
  landing_page: 'Proceed to Launch Posts',
  launch_posts: 'Generate AI Agent Prompts',
  agent_prompts: 'View Full Results',
};

export type Phase = 'idle' | 'running' | 'queued' | 'awaiting' | 'complete';

export type SseEventType =
  | 'task_done'
  | 'output'
  | 'complete'
  | 'error'
  | 'status'
  | 'delta'
  | 'queued';

export interface SseEvent {
  type: SseEventType;
  task?: TaskName;
  field?: OutputField;
  message?: string;
  content?: string;
  position?: number;
  run?: Partial<Run>;
  /** When true, show as dim log line in the streaming terminal */
  log?: boolean;
}

export interface ParsedPosts {
  twitter: string | null;
  hn: string | null;
  reddit: string | null;
  fallback: string | null;
}
