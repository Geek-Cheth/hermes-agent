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
      className="text-xs text-[#71717a] hover:text-[#fafafa] px-2 py-1 rounded border border-[#262626] transition-colors"
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
      className="rounded-2xl border border-[#262626] bg-[#0a0a0a] overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/40 hover:border-[#404040]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#111111]">
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
            <div className="flex gap-6 mt-3 text-[#52525b] text-xs">
              <span>↩ 12</span>
              <span>🔁 8</span>
              <span>♡ 124</span>
              <span>⬚ 2.1K</span>
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
      className="rounded-2xl border border-[#262626] overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/40 hover:border-[#404040]"
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
      className="rounded-2xl border border-[#262626] bg-[#1a1a1b] overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/40 hover:border-[#404040]"
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
            <div className="flex gap-4 mt-3 text-xs text-[#818384] font-bold">
              <span>💬 32 Comments</span>
              <span>↗ Share</span>
              <span>🏆 Award</span>
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
      <div className="prose-invert-dark rounded-2xl border border-[#262626] bg-[#111111] p-6">
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
