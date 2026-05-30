import { SENTINELS } from './hermes';
import { ParsedPosts } from './types';

function extractBetween(text: string, sentinel: string): string | null {
  const first = text.indexOf(sentinel);
  if (first === -1) return null;
  const second = text.indexOf(sentinel, first + sentinel.length);
  if (second === -1) return null;
  return text.slice(first + sentinel.length, second).trim() || null;
}

export function parsePostsMarkdown(postsMd: string): ParsedPosts {
  const twitter =
    extractBetween(postsMd, SENTINELS.twitter) ??
    extractBetween(postsMd, '===TWITTER===');
  const hn =
    extractBetween(postsMd, SENTINELS.hn) ??
    extractBetween(postsMd, '===HN===');
  const reddit =
    extractBetween(postsMd, SENTINELS.reddit) ??
    extractBetween(postsMd, '===REDDIT===');

  return {
    twitter,
    hn,
    reddit,
    fallback: !twitter && !hn && !reddit ? postsMd : null,
  };
}
