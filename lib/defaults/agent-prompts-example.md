# Agent Prompts — Example Output

Use this as your quality bar. The coding agent prompt must be copy-paste ready — specific enough that an AI coding agent can begin immediately without asking clarifying questions.

---

## Example: Product idea = "AI contract review tool for freelancers"

---

## Business & Build Plan

**Vision:** Give solo freelancers a contract lawyer in their pocket — upload any PDF or paste any text, get back a plain-English risk report with the three things to fix before you sign, in under 60 seconds, for less than a coffee.

**MVP scope (ships in week 1):**
- Upload contract PDF or paste raw text
- AI extracts and flags: payment terms, IP ownership clauses, liability caps, non-compete scope, termination rights
- Returns colour-coded risk summary (red/yellow/green per clause category)
- Pay-per-review via Stripe ($4.99/review or $19/month for 10 reviews)
- No account required for first review

**Core features:**
- PDF text extraction (pdf-parse or AWS Textract fallback)
- Clause classification + risk scoring via GPT-4o with a system prompt trained on 50 common freelancer contract risks
- Plain-English explanation per flag, not legal jargon
- Suggested rewrite for each red clause
- Email delivery of report (optional, triggers upsell to account)

**Recommended stack:**
- Frontend: Next.js 14 App Router + Tailwind
- Backend: Next.js API routes + Supabase (Postgres + Storage for PDFs)
- AI: OpenAI GPT-4o (structured outputs for clause JSON)
- Payments: Stripe Checkout (one-time + subscription)
- PDF extraction: pdf-parse (Node) with Textract fallback for scanned docs
- Email: Resend

**Milestones:**
1. Upload → extract text → display raw text (Day 1)
2. Clause classification prompt working, returning structured JSON (Day 2)
3. Risk UI rendering red/yellow/green cards with explanations (Day 3)
4. Stripe Checkout integrated, review gated behind payment (Day 4)
5. Email report delivery + basic account/history (Day 5–6)
6. Polish, mobile responsive, deploy to Vercel (Day 7)

---

## Prompts for Other AI Agents

### Coding Agent (full-stack MVP)

```
Build a Next.js 14 App Router application called "ContractCheck" — an AI-powered contract review tool for freelancers.

STACK:
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres + Storage)
- OpenAI SDK (gpt-4o, structured outputs)
- Stripe (Checkout Sessions + Webhooks)
- pdf-parse (PDF text extraction)
- Resend (transactional email)

FOLDER STRUCTURE:
app/
  page.tsx                  — upload form (drag-and-drop PDF or paste text)
  review/[id]/page.tsx      — results page (clause cards)
  api/
    upload/route.ts         — accept PDF/text, store in Supabase Storage, create review record
    review/[id]/route.ts    — trigger AI analysis, return structured JSON
    stripe/checkout/route.ts — create Checkout Session
    stripe/webhook/route.ts  — fulfil review on payment success
lib/
  extract.ts     — pdf-parse wrapper, returns plain text string
  analyze.ts     — OpenAI call with structured output schema
  supabase.ts    — typed client + helpers
  stripe.ts      — Stripe client + price IDs
components/
  UploadZone.tsx  — drag-drop or paste textarea
  ClauseCard.tsx  — single clause with risk level, explanation, suggested rewrite
  RiskBadge.tsx   — red/yellow/green pill

DATABASE SCHEMA (Supabase):
reviews table: id uuid, status (pending/paid/complete/error), pdf_url text, raw_text text, result_json jsonb, email text nullable, stripe_session_id text, created_at timestamptz
No auth required for MVP — anonymous reviews identified by uuid.

AI ANALYSIS (lib/analyze.ts):
Call GPT-4o with response_format: { type: 'json_schema' }.
Schema: { clauses: [ { category: string, risk: 'red'|'yellow'|'green', quote: string, explanation: string, suggested_rewrite: string } ] }
Categories to extract: payment_terms, ip_ownership, liability_cap, non_compete, termination, governing_law, indemnification.
System prompt: "You are a contract lawyer reviewing agreements on behalf of freelancers and independent contractors. Extract and assess risk for each clause category below. Explain each finding in plain English a non-lawyer can act on. Suggest a specific rewrite for every red-risk clause."

STRIPE FLOW:
- Price: $4.99 one-time (price ID from env STRIPE_PRICE_ID_SINGLE)
- On Checkout Session completed webhook: set review status = 'paid', trigger AI analysis, set status = 'complete'
- Results page polls /api/review/[id] every 2s until status = 'complete'

ACCEPTANCE CRITERIA:
- User can upload a PDF under 10MB or paste up to 20,000 chars of text
- Analysis returns within 30 seconds for a 5-page contract
- Results page shows clause cards grouped by risk level (red first)
- Stripe payment gate works end-to-end in test mode
- Mobile-responsive at 375px width
- No TypeScript errors, no console errors in browser
```

### Design Agent (UI polish)

```
Refine the UI of ContractCheck, an AI contract review tool for freelancers. The app uses Next.js 14 + Tailwind.

DESIGN DIRECTION:
- Dark theme. Background #0a0a0a, surface #111111, text #fafafa.
- Clean, minimal, confidence-inspiring — looks like a tool a lawyer would trust, not a startup toy.
- No gradients, no glows, no decorative blobs. Single accent color: #3b5bdb (used only on risk badges and CTAs).

COMPONENTS TO REFINE:

1. UploadZone — drag-drop area should have dashed border (rgba(255,255,255,0.10)), subtle pulse animation on drag-over, clear "or paste your contract below" fallback textarea. No big colourful icon.

2. ClauseCard — three variants: red (border-left: 3px solid #ef4444), yellow (border-left: 3px solid #f59e0b), green (border-left: 3px solid #22c55e). Card background #111111, border rgba(255,255,255,0.07). Inside: small caps category label, the quoted clause text in mono font size 13px, plain-English explanation, and a collapsed "Suggested rewrite" (expand on click).

3. Risk summary bar at top of results — three counters (Red: N / Yellow: N / Green: N) in a horizontal strip. Just numbers and labels, no pie charts.

4. CTA button — pill shape (border-radius: 9999px), background #ffffff, color #000, font-weight 600. Hover: #e4e4e7. Never rounded-lg.

TYPOGRAPHY:
- H1: 40px, weight 700, letter-spacing -0.5px
- Body: 18px, weight 400, color #71717a
- Mono (clause quotes): font-family: 'IBM Plex Mono', monospace; size 13px; color #a1a1aa

Do not add animations beyond subtle transitions (0.15s ease). Do not add decorative elements not described above.
```

### Marketing Agent (growth)

```
Write a 6-email post-launch sequence for ContractCheck, an AI contract review tool for freelancers ($4.99/review).

TARGET USER: Solo freelancers — designers, developers, copywriters — who sign 2–10 client contracts per year and have been burned by bad contract terms at least once.

SEQUENCE:
Email 1 (send immediately after signup/first review): Welcome + "what to do with your report" — walk through the three highest-priority red flags and what to ask the client to change.
Email 2 (Day 3): Educational — "The 5 contract clauses that cost freelancers the most money" — no product pitch, just value.
Email 3 (Day 7): Case study format — "How [type of freelancer] avoided a $8,000 IP dispute" — hypothetical but realistic scenario. CTA: review your next contract.
Email 4 (Day 14): Feature spotlight — the suggested rewrite tool. Show a before/after of a bad liability clause.
Email 5 (Day 21): Social proof ask — "If ContractCheck saved you from a bad clause, we'd love a one-sentence quote for our site."
Email 6 (Day 30): Subscription upsell — introduce the $19/month plan for 10 reviews. Frame as: if you sign more than 4 contracts a year, the math works out.

TONE: Peer-to-peer. Like a friend who happens to be a lawyer. Not corporate. Short paragraphs. No exclamation points except in subject lines if genuinely warranted.
Subject line format: Specific and curiosity-driven. Not "Check out our new feature!" but "The clause that voids your payment if the client 'isn't satisfied'".

Also write:
- 3 SEO-targeted blog post outlines (target: "freelance contract review", "IP clause freelancer", "how to review a client contract")
- 1 Product Hunt launch description (tagline + 250-word body)
- 5 reply-style tweets for seeding in freelancer Twitter threads about contract disputes
```
