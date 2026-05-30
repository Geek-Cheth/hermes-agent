'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { IdeaForm } from '@/components/IdeaForm';
import { Navbar } from '@/components/Navbar';
import { OutputPanel } from '@/components/OutputPanel';
import { PostCards } from '@/components/PostCards';
import { StageProgress } from '@/components/StageProgress';
import { ThinkingLoader } from '@/components/ThinkingLoader';
import { WaitingList } from '@/components/WaitingList';
import { nextStatusMessage } from '@/lib/status-messages';
import { getResumeState, taskOutputsFromRun } from '@/lib/resume';
import {
  DEFAULT_TASKS,
  Phase,
  PROCEED_LABELS,
  Run,
  SseEvent,
  TASK_LABELS,
  TASK_NAMES,
  TASK_TO_FIELD,
  TaskName,
  TasksMap,
} from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [runId, setRunId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [viewStep, setViewStep] = useState(0);
  const [tasks, setTasks] = useState<TasksMap>(DEFAULT_TASKS);
  const [streamText, setStreamText] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [queuePosition, setQueuePosition] = useState(0);
  const [taskOutputs, setTaskOutputs] = useState<Partial<Record<TaskName, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const phaseRef = useRef<Phase>(phase);
  const streamClosedOkRef = useRef(false);
  const resumeHandledRef = useRef(false);
  phaseRef.current = phase;

  const activeTask =
    phase === 'running' || phase === 'queued' ? TASK_NAMES[currentStep] : null;
  const currentTaskName = TASK_NAMES[currentStep];
  const viewTaskName = TASK_NAMES[viewStep];
  const isViewingPastStep = viewStep < currentStep;
  const isViewingCurrent =
    viewStep === currentStep &&
    (phase === 'running' || phase === 'queued' || phase === 'awaiting');
  const showWorkflow = runId && phase !== 'idle';

  const closeStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => () => closeStream(), [closeStream]);

  const runTask = useCallback(
    (task: TaskName, id: string, ideaText: string) => {
      closeStream();
      setStreamText('');
      setCurrentStatus(nextStatusMessage(task, 0));
      setQueuePosition(0);
      streamClosedOkRef.current = false;
      setPhase('running');
      setError(null);
      setTasks((prev) => ({ ...prev, [task]: 'active' }));

      const es = new EventSource(
        `/api/run-task?task=${task}&runId=${id}&idea=${encodeURIComponent(ideaText)}`
      );
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as SseEvent;

          if (data.type === 'queued' && data.position) {
            setPhase('queued');
            setQueuePosition(data.position);
            return;
          }

          if (
            data.type === 'status' &&
            data.message &&
            data.message !== 'awaiting_approval'
          ) {
            setPhase('running');
            setCurrentStatus(data.message);
          }

          if (data.type === 'delta' && data.content) {
            setPhase('running');
            setStreamText((prev) => prev + data.content);
          }

          if (data.type === 'output' && data.field && data.message) {
            const taskKey = Object.entries(TASK_TO_FIELD).find(
              ([, f]) => f === data.field
            )?.[0] as TaskName | undefined;
            if (taskKey) {
              setTaskOutputs((prev) => ({ ...prev, [taskKey]: data.message }));
            }
          }

          if (data.type === 'task_done' && data.task) {
            setTasks((prev) => ({ ...prev, [data.task as TaskName]: 'done' }));
          }

          if (data.type === 'status' && data.message === 'awaiting_approval') {
            streamClosedOkRef.current = true;
            setPhase('awaiting');
            closeStream();
          }

          if (data.type === 'complete') {
            streamClosedOkRef.current = true;
            setPhase('complete');
            closeStream();
          }

          if (data.type === 'error') {
            setError(data.message ?? 'Something went wrong');
            setPhase('idle');
            closeStream();
          }
        } catch {
          // ignore malformed
        }
      };

      es.onerror = () => {
        if (streamClosedOkRef.current) {
          closeStream();
          return;
        }
        if (phaseRef.current === 'running' || phaseRef.current === 'queued') {
          setError(
            'Connection lost while streaming. Check History or try again.'
          );
          setPhase('idle');
        }
        closeStream();
      };
    },
    [closeStream]
  );

  useEffect(() => {
    if (resumeHandledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get('resume');
    if (!resumeId) return;

    resumeHandledRef.current = true;
    setResuming(true);

    (async () => {
      try {
        const res = await fetch(`/api/runs/${resumeId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to load run');
        }

        const run = (await res.json()) as Run;
        const resume = getResumeState(run);

        if (resume.action === 'redirect_results') {
          router.replace(`/results/${resumeId}`);
          return;
        }

        setIdea(run.idea);
        setRunId(run.id);
        setTasks(run.tasks);
        setTaskOutputs(taskOutputsFromRun(run));
        setStreamText('');
        setCurrentStatus('');
        setCurrentStep(resume.currentStep);
        setViewStep(resume.viewStep);
        setPhase(resume.phase);
        setError(null);

        window.history.replaceState({}, '', '/');

        if (resume.action === 'run') {
          runTask(TASK_NAMES[resume.currentStep], run.id, run.idea);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resume run');
        setPhase('idle');
      } finally {
        setResuming(false);
      }
    })();
  }, [router, runTask]);

  function handleStart() {
    if (!idea.trim()) return;

    const id = crypto.randomUUID();
    setRunId(id);
    setCurrentStep(0);
    setViewStep(0);
    setTasks(DEFAULT_TASKS);
    setTaskOutputs({});
    setStreamText('');
    setCurrentStatus('');
    setQueuePosition(0);
    setPhase('running');
    runTask(TASK_NAMES[0], id, idea.trim());
  }

  function handleProceed() {
    if (!runId) return;

    const isLast = currentStep >= TASK_NAMES.length - 1;
    if (isLast) {
      setPhase('complete');
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setViewStep(nextStep);
    runTask(TASK_NAMES[nextStep], runId, idea.trim());
  }

  function renderStageOutput(task: TaskName) {
    const output = taskOutputs[task];

    if (!output && task === TASK_NAMES[currentStep] && phase === 'awaiting') {
      return (
        <div className="mt-4 prose-invert-dark rounded-xl border border-[#262626] bg-[#111111] p-4">
          <p className="text-sm text-[#71717a]">
            {streamText.trim()
              ? 'Output saved. Review below or proceed.'
              : 'Output saved. Proceed to continue.'}
          </p>
          {streamText.trim() && (
            <pre className="mt-3 text-sm text-zinc-400 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto scrollbar-dark">
              {streamText.slice(0, 2000)}
              {streamText.length > 2000 ? '…' : ''}
            </pre>
          )}
        </div>
      );
    }

    if (!output) return null;

    if (task === 'landing_page' && runId) {
      return (
        <OutputPanel
          title="Landing Page Preview"
          content={output}
          language="preview"
          previewUrl={`/api/preview/${runId}`}
        />
      );
    }

    if (task === 'launch_posts') {
      return <PostCards postsMd={output} />;
    }

    if (task === 'agent_prompts') {
      return (
        <OutputPanel
          title="AI Agent Prompts"
          content={output}
          language="markdown"
        />
      );
    }

    return (
      <OutputPanel
        title={TASK_LABELS[task]}
        content={output}
        language="markdown"
      />
    );
  }

  function renderFocusedContent() {
    const task = viewTaskName;

    if (isViewingPastStep) {
      return (
        <motion.div
          key={`past-${viewStep}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          className="space-y-4"
        >
          {(phase === 'running' || phase === 'queued') &&
            viewStep < currentStep && (
            <p className="text-xs text-sky-400/90 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              {TASK_LABELS[TASK_NAMES[currentStep]]} is still running…
            </p>
          )}
          {renderStageOutput(task)}
          <button
            type="button"
            onClick={() => setViewStep(currentStep)}
            className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            Return to current step →
          </button>
        </motion.div>
      );
    }

    if (phase === 'queued' && viewStep === currentStep) {
      return (
        <motion.div
          key={`queued-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <WaitingList
            position={queuePosition}
            label={TASK_LABELS[currentTaskName]}
          />
        </motion.div>
      );
    }

    if (phase === 'running' && viewStep === currentStep) {
      return (
        <motion.div
          key={`running-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ThinkingLoader
            message={currentStatus}
            label={TASK_LABELS[currentTaskName]}
          />
        </motion.div>
      );
    }

    if (phase === 'awaiting' && viewStep === currentStep) {
      return (
        <motion.div
          key={`awaiting-${viewStep}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {renderStageOutput(task)}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleProceed}
            className="w-full bg-white text-black py-3 rounded-xl text-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            {PROCEED_LABELS[currentTaskName]}
          </motion.button>
        </motion.div>
      );
    }

    if (phase === 'complete') {
      return (
        <motion.div
          key="complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {renderStageOutput(TASK_NAMES[TASK_NAMES.length - 1])}
          {runId && (
            <Link
              href={`/results/${runId}`}
              className="block text-center w-full bg-emerald-500 text-black py-3 rounded-xl text-lg font-medium hover:bg-emerald-400 transition-colors"
            >
              View full results →
            </Link>
          )}
        </motion.div>
      );
    }

    return null;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {!showWorkflow && !resuming ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                StartupForge
              </h1>
              <p className="text-[#71717a] mb-8">
                Describe your idea. Review each step before proceeding.
              </p>
            </motion.div>
          ) : resuming ? (
            <motion.div
              key="resuming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-[#71717a]">Restoring your run…</p>
            </motion.div>
          ) : (
            <motion.div
              key="workflow-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <p className="text-xs uppercase tracking-widest text-[#52525b] mb-1">
                Your idea
              </p>
              <p className="text-[#fafafa] font-medium line-clamp-2 italic">
                &ldquo;{idea}&rdquo;
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!showWorkflow && !resuming ? (
            <IdeaForm
              key="form"
              idea={idea}
              onIdeaChange={setIdea}
              onRun={handleStart}
              isRunning={phase === 'running' || phase === 'queued'}
              disabled={
                phase === 'running' ||
                phase === 'queued' ||
                phase === 'awaiting'
              }
            />
          ) : null}
        </AnimatePresence>

        {error && (
          <p className="mt-4 text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-lg p-3">
            {error}
          </p>
        )}

        <AnimatePresence>
          {showWorkflow && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 space-y-8"
            >
              <StageProgress
                tasks={tasks}
                currentStep={currentStep}
                viewStep={viewStep}
                onViewStepChange={setViewStep}
              />

              <AnimatePresence mode="wait">
                {renderFocusedContent()}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
