const MAX_IDEA_LENGTH = 600;

// Patterns that could hijack prompt structure or fake task outputs
const STRIP_PATTERNS = [
  /={3}[A-Z_]+={3}/g,           // ===SENTINEL===
  /TASK_DONE\s*:/gi,            // TASK_DONE: ...
  /TELEGRAM_SUMMARY\s*:/gi,     // TELEGRAM_SUMMARY: ...
  /PROGRESS\s*:/gi,             // PROGRESS: ...
  /<\/?(?:system|instruction|prompt|context|user|assistant)[^>]*>/gi, // XML-style injection tags
];

// Phrases that attempt instruction override
const OVERRIDE_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/gi,
  /disregard\s+(the\s+)?(above|previous|prior)/gi,
  /new\s+instructions?\s*:/gi,
  /system\s+prompt/gi,
  /you\s+are\s+now/gi,
  /forget\s+(everything|all)/gi,
];

export function sanitizeIdea(raw: string): string {
  let s = raw.slice(0, MAX_IDEA_LENGTH);

  for (const pattern of STRIP_PATTERNS) {
    s = s.replace(pattern, '[removed]');
  }

  for (const pattern of OVERRIDE_PATTERNS) {
    s = s.replace(pattern, '[removed]');
  }

  // Collapse excessive newlines (limit to 2 in a row)
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}
