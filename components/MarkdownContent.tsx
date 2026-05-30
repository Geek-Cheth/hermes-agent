'use client';

import { isValidElement, useState } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function extractCodeText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractCodeText).join('');
  if (isValidElement(children)) {
    return extractCodeText(children.props.children);
  }
  return String(children ?? '');
}

function extractLanguage(children: React.ReactNode): string | null {
  if (!isValidElement(children)) return null;
  const className = children.props.className;
  if (typeof className !== 'string') return null;
  const match = className.match(/language-([\w-]+)/);
  return match ? match[1] : null;
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeText = extractCodeText(children).replace(/\n$/, '');
  const language = extractLanguage(children);

  async function handleCopy() {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-4 rounded-lg border border-[#262626] bg-[#0d0d0d] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#262626] bg-[#111111]">
        <span className="text-xs font-medium uppercase tracking-wide text-[#71717a]">
          {language ?? 'prompt'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-[#71717a] hover:text-[#fafafa] px-2.5 py-1 rounded-md border border-[#262626] transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="m-0 p-4 overflow-x-hidden bg-transparent border-0 rounded-none">
        <code className="block whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300 font-mono bg-transparent p-0">
          {codeText}
        </code>
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-400 underline underline-offset-2 decoration-sky-400/40 hover:text-sky-300 hover:decoration-sky-300 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = 'prose-invert-dark' }: MarkdownContentProps) {
  return (
    <article className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
