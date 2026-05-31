'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { parsePostsMarkdown } from '@/lib/posts';

interface PostCardsProps {
  postsMd: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-[#71717a] hover:text-[#fafafa] px-2 py-1 rounded-full border border-white/[0.06] transition-colors"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function splitTwitterThread(content: string): string[] {
  const lines = content.split('\n').filter((l) => l.trim());
  const numbered = lines.filter((l) => /^\s*\d+[\/.)\]]/.test(l.trim()));
  if (numbered.length >= 2) return numbered;
  const chunks = content.split(/\n(?=\d+[\/.)\]])/).filter((c) => c.trim());
  if (chunks.length >= 2) return chunks;
  return [content];
}

function TwitterCard({ content }: { content: string }) {
  const tweets = splitTwitterThread(content);

  return (
    <motion.section
      layout
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] overflow-hidden transition-colors hover:border-white/20"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#111111]">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fafafa] text-black text-sm font-bold">
            𝕏
          </span>
          <div>
            <p className="text-sm font-semibold text-[#fafafa]">Launch thread</p>
            <p className="text-xs text-[#71717a]">Twitter / X</p>
          </div>
        </div>
        <CopyButton text={content} />
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800" />
            {tweets.length > 1 && (
              <div className="w-0.5 flex-1 min-h-[24px] bg-[#262626] my-1" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-center gap-1 mb-3">
              <span className="font-bold text-[#fafafa] text-sm">Your Product</span>
              <span className="text-[#71717a] text-sm">@yourproduct</span>
              <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.954-.84 1.602-2.038 1.602-3.6 0-2.21-1.79-4-4-4-1.58 0-2.95.875-3.6 2.148-.84-.954-2.038-1.602-3.6-1.602-2.21 0-4 1.79-4 4 0 1.58.875 2.95 2.148 3.6-.954.84-1.602 2.038-1.602 3.6 0 2.21 1.79 4 4 4 1.58 0 2.95-.875 3.6-2.148.84.954 2.038 1.602 3.6 1.602 2.21 0 4-1.79 4-4z" />
              </svg>
            </div>
            <div className="space-y-4">
              {tweets.map((tweet, i) => (
                <div key={i} className="prose-invert-dark text-sm">
                  <ReactMarkdown>{tweet}</ReactMarkdown>
                </div>
              ))}
            </div>
            <div className="flex gap-5 mt-4 text-[#536471]">
              <button type="button" className="flex items-center gap-1.5 hover:text-sky-400 transition-colors group">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.863 3.706 7.863 8.001 0 3.662-2.051 6.876-5.055 8.677L12.5 23v-4.338c-5.072-.101-10.749-3.505-10.749-8.662z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs tabular-nums">12</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 3v8.45l2.068-1.93 1.364 1.46L15.5 15.12l-4.432-4.14 1.364-1.46L14.5 11.45V5h-3V3h5z" fill="currentColor"/>
                </svg>
                <span className="text-xs tabular-nums">8</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-pink-400 transition-colors group">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.5.67-.5-.67C10.963 6.01 9.506 5.44 8.284 5.5c-1.647.073-3.134 1.237-3.134 3.345 0 2.282 2.084 4.658 5.142 7.29C11.667 17.25 12 17.5 12 17.5s.333-.25 1.708-1.365c3.058-2.632 5.142-5.008 5.142-7.29 0-2.108-1.487-3.272-3.153-3.345z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs tabular-nums">124</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-sky-400 transition-colors group">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" fill="currentColor"/>
                </svg>
                <span className="text-xs tabular-nums">2.1K</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function HackerNewsCard({ content }: { content: string }) {
  const titleMatch = content.match(/Show HN:?\s*(.+)/i);
  const title = titleMatch?.[1]?.split('\n')[0]?.trim() ?? 'Show HN: Your Product';

  return (
    <motion.section
      layout
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/[0.07] overflow-hidden transition-colors hover:border-white/20"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#ff6600]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-white/20 text-white font-bold text-sm">
            Y
          </span>
          <span className="text-white font-semibold text-sm">Hacker News</span>
        </div>
        <CopyButton text={content} />
      </div>
      <div className="bg-[#f6f6ef] text-[#000] p-4">
        <p className="text-[#ff6600] font-medium text-sm mb-1 hover:underline cursor-default">
          Show HN: {title.replace(/^Show HN:?\s*/i, '')}
        </p>
        <p className="text-xs text-[#828282] mb-3">
          42 points · 3 hours ago · 18 comments
        </p>
        <div className="prose text-sm text-[#000] max-w-none [&_p]:text-[#000] [&_li]:text-[#000]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.section>
  );
}

function RedditCard({ content }: { content: string }) {
  const subMatch = content.match(/r\/[\w]+/i);
  const subreddit = subMatch?.[0] ?? 'r/startups';

  return (
    <motion.section
      layout
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/[0.07] bg-[#1a1a1b] overflow-hidden transition-colors hover:border-white/20"
    >
      <div className="flex">
        <div className="flex flex-col items-center py-3 px-2 bg-[#161617] text-[#818384] w-10 shrink-0">
          <span className="text-lg leading-none">▲</span>
          <span className="text-xs font-bold text-[#d7dadc] my-0.5">247</span>
          <span className="text-lg leading-none">▼</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#343536]">
            <div className="flex items-center gap-2 text-xs text-[#818384]">
              <span className="font-bold text-[#d7dadc]">{subreddit}</span>
              <span>·</span>
              <span>Posted by u/you</span>
            </div>
            <CopyButton text={content} />
          </div>
          <div className="p-3">
            <div className="prose-invert-dark text-sm">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            <div className="flex gap-1 mt-3 text-xs text-[#818384] font-bold">
              <button type="button" className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#33343a] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 4V5z"/>
                </svg>
                32 Comments
              </button>
              <button type="button" className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#33343a] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
                Share
              </button>
              <button type="button" className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#33343a] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm0 6a1 1 0 100 2h.01a1 1 0 100-2H5zm4 0a1 1 0 100 2h.01a1 1 0 100-2H9zm4 0a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd"/>
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35 },
  }),
};

export function PostCards({ postsMd }: PostCardsProps) {
  const parsed = parsePostsMarkdown(postsMd);

  if (parsed.fallback) {
    return (
      <div className="prose-invert-dark rounded-2xl border border-white/[0.07] bg-[#111111] p-6">
        <ReactMarkdown>{parsed.fallback}</ReactMarkdown>
      </div>
    );
  }

  const cards: { key: string; node: ReactNode }[] = [];
  if (parsed.twitter) cards.push({ key: 'twitter', node: <TwitterCard content={parsed.twitter} /> });
  if (parsed.hn) cards.push({ key: 'hn', node: <HackerNewsCard content={parsed.hn} /> });
  if (parsed.reddit) cards.push({ key: 'reddit', node: <RedditCard content={parsed.reddit} /> });

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {card.node}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
