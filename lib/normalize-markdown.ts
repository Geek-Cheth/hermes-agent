const FENCE_RE = /(```[\s\S]*?```)/g;

function normalizeMarkdownSegment(segment: string): string {
  let out = segment;

  // Fix headings glued to preceding text on the same line (e.g. "...ML### TrustMeter")
  out = out.replace(/([^\n])(#{2,6}\s)/g, '$1\n\n$2');

  // Ensure a blank line before a heading that starts on its own line
  out = out.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');

  // Ensure a blank line after a heading before non-blank content
  out = out.replace(/^(#{1,6}\s[^\n]+)\n(?!\n)(?=\S)/gm, '$1\n\n');

  // Collapse excessive blank lines
  out = out.replace(/\n{3,}/g, '\n\n');

  return out;
}

/**
 * Repair common structural markdown defects from LLM output.
 * Skips fenced code blocks so prompt/code content is left untouched.
 */
export function normalizeMarkdown(md: string): string {
  const parts = md.split(FENCE_RE);

  const normalized = parts.map((part) => {
    if (part.startsWith('```')) return part;
    return normalizeMarkdownSegment(part);
  });

  return normalized.join('').trim();
}
