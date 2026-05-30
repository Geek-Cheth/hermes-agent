'use client';

import { useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  logs: string[];
  isStreaming: boolean;
}

export function StreamingText({ text, logs, isStreaming }: StreamingTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [text, logs]);

  const hasContent = text.trim().length > 0 || logs.length > 0;

  return (
    <div
      ref={ref}
      className="font-mono text-sm bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-4 h-64 overflow-y-auto scrollbar-dark"
    >
      {logs.map((line, i) => (
        <div key={i} className="text-[#71717a] mb-1">
          {line}
        </div>
      ))}
      {text ? (
        <pre className="text-zinc-300 whitespace-pre-wrap">{text}</pre>
      ) : !hasContent ? (
        <span className="text-[#71717a]">Waiting for agent output…</span>
      ) : null}
      {isStreaming && (
        <span className="animate-pulse text-sky-400"> ▋</span>
      )}
    </div>
  );
}
