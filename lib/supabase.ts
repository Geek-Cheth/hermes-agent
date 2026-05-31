import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_TASKS,
  OutputField,
  Run,
  RunStatus,
  TaskName,
  TaskStatus,
  TasksMap,
} from './types';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabase;
}

export async function createRun(
  id: string,
  idea: string,
  userId: string
): Promise<Run> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .insert({
      id,
      idea,
      user_id: userId,
      status: 'running',
      tasks: DEFAULT_TASKS,
    })
    .select()
    .single();

  if (error) throw new Error(`createRun failed: ${error.message}`);
  return data as Run;
}

export async function getRun(id: string): Promise<Run | null> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getRun failed: ${error.message}`);
  }

  return data as Run;
}

export async function getRunForUser(
  id: string,
  userId: string
): Promise<Run | null> {
  const run = await getRun(id);
  if (!run) return null;
  if (run.user_id !== userId) return null;
  return run;
}

export async function listRunsByUser(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Run[]> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`listRunsByUser failed: ${error.message}`);
  return (data ?? []) as Run[];
}

export async function updateRunTask(
  id: string,
  task: TaskName,
  status: TaskStatus
): Promise<Run> {
  const run = await getRun(id);
  if (!run) throw new Error(`Run ${id} not found`);

  const tasks: TasksMap = { ...run.tasks, [task]: status };

  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .update({ tasks })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateRunTask failed: ${error.message}`);
  return data as Run;
}

export async function saveRunTemplate(
  id: string,
  template: string,
  styleNotes: string | null
): Promise<Run> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .update({
      landing_template: template,
      landing_style_notes: styleNotes?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`saveRunTemplate failed: ${error.message}`);
  return data as Run;
}

export async function saveRunOutput(
  id: string,
  field: OutputField,
  content: string
): Promise<Run> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .update({ [field]: content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`saveRunOutput failed: ${error.message}`);
  return data as Run;
}

export async function completeRun(id: string): Promise<Run> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .update({
      status: 'complete' satisfies RunStatus,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`completeRun failed: ${error.message}`);
  return data as Run;
}

export async function failRun(id: string, message: string): Promise<Run> {
  const client = getSupabase();
  const { data, error } = await client
    .from('runs')
    .update({
      status: 'error' satisfies RunStatus,
      error_message: message,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`failRun failed: ${error.message}`);
  return data as Run;
}

export async function countRunsThisMonth(userId: string): Promise<number> {
  const now = new Date();
  const firstOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const client = getSupabase();
  const { count, error } = await client
    .from('runs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstOfMonth);

  if (error) throw new Error(`countRunsThisMonth failed: ${error.message}`);
  return count ?? 0;
}

export async function countRunsToday(userId: string): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();

  const client = getSupabase();
  const { count, error } = await client
    .from('runs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay);

  if (error) throw new Error(`countRunsToday failed: ${error.message}`);
  return count ?? 0;
}

export async function deleteRunForUser(
  id: string,
  userId: string
): Promise<boolean> {
  const run = await getRunForUser(id, userId);
  if (!run) return false;

  const client = getSupabase();
  const { error } = await client
    .from('runs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`deleteRunForUser failed: ${error.message}`);
  return true;
}

export async function addWaitlistEntry(
  email: string,
  source?: string,
  runId?: string
): Promise<{ id: string }> {
  const client = getSupabase();
  const { data, error } = await client
    .from('waitlist')
    .insert({
      email: email.trim().toLowerCase(),
      source: source ?? null,
      run_id: runId ?? null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Email already on the waitlist');
    }
    throw new Error(`addWaitlistEntry failed: ${error.message}`);
  }

  return { id: data.id };
}
