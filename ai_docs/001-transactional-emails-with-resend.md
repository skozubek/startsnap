# AI Task Planning Template - Starter Framework

> About This Task: Add secure transactional email notifications to startsnap.fun using Resend, implemented via Supabase Edge Functions to keep the API key server-side and private. Triggers: new feedback, reply to feedback, and project support.

---

## 1. Task Overview

### Task Title
**Title:** Add transactional email notifications with Resend via Supabase Edge Functions

### Goal Statement
**Goal:** Implement reliable, secure email notifications so users are alerted when: (1) their project receives new feedback, (2) someone replies to their feedback, and (3) someone supports their project. Emails are sent from Supabase Edge Functions using the Resend API key stored in server-side environment variables. This closes the feedback loop, drives return visits, and increases engagement.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Vite + React + TypeScript
- **Language:** TypeScript
- **Database & ORM:** Supabase Postgres, Row Level Security; direct JS client
- **UI & Styling:** Tailwind CSS + 2025 CSS Component System; design tokens in `docs/color-system.md`
- **Authentication:** Supabase Auth
- **Key Architectural Patterns:** Client-side React app with Supabase client; server-side logic in Supabase Edge Functions (Deno); shared CORS helper at `supabase/functions/_shared/cors.ts`

### Current State
- Users can leave feedback and replies; tips/support exist.
- No transactional emails are sent. Users don’t get notified, reducing engagement and reply rates.

---

## 3. Context & Problem Definition

### Problem Statement
Users receive feedback but are not notified. The platform feels inactive, and creators miss opportunities to respond. We need timely notification emails for key community actions.

### Success Criteria
- [ ] Email sent to project owner on new feedback.
- [ ] Email sent to commenter on reply to their feedback.
- [ ] Email sent to project owner when someone supports their project.
- [ ] Resend API key never exposed client-side; only used in Edge Functions.
- [ ] End-to-end tests (manual or automated) show emails sent and links navigate to correct pages.
- [ ] Robust error handling and logging without leaking secrets.

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Production-bound feature on active codebase.
- **Breaking Changes:** Avoid DB schema-breaking changes; add-only where needed.
- **Data Handling:** Protect PII (emails). Never log raw API keys or sensitive content.
- **User Base:** All registered users receiving/creating feedback or support.
- **Priority:** Reliability and security over raw speed; aim for low latency.

---

## 5. Technical Requirements

### Functional Requirements
- **Trigger 1:** On new feedback for a project, notify the project owner.
- **Trigger 2:** On reply to feedback, notify the original commenter.
- **Trigger 3:** On support/tip, notify the project owner.
- Emails include: actionable subject, concise body, project title, snippet of content, deep link back to startsnap.fun relevant page, and unsubscribe/manage notifications link placeholder.

### Non-Functional Requirements
- **Performance:** Email submission under ~500ms from Edge Function; end-to-end < a few seconds is acceptable.
- **Security:** Use server-side env `RESEND_API_KEY` in Edge Functions; never expose client.
- **Usability:** Clear, friendly copy. Accessible HTML email.
- **Responsive Design:** Use React Email components or simple responsive HTML.
- **Theme Support:** Not required for emails; keep brand-consistent.

### Technical Constraints
- Must integrate with Supabase Edge Functions (Deno runtime) and existing `_shared/cors.ts`.
- Follow existing Supabase usage patterns in the app.
- Avoid adding complex backend outside Supabase functions.

---

## 6. Data & Database Changes

### Database Schema Changes
- Optional (Phase 2): Add `email_notifications_enabled` boolean to `profiles` (default true) for user-level opt-out.

### Data Model Updates
- Ensure types for activity/feedback include enough fields to build email payloads (author, target user email, project title, URLs).

### Data Migration Plan
- Backfill `email_notifications_enabled` to true for existing profiles (if added).

---

## 7. API & Backend Changes

### Data Access Pattern Rules
- Client will call a secure Edge Function with minimal payload (IDs only). The function will fetch enriched data server-side to avoid trusting client-provided strings.

### Server Actions (Edge Functions)
- `notify-new-feedback`: Given `feedback_id`, look up project, owner email, and send email.
- `notify-reply-feedback`: Given `reply_id`, look up original feedback and commenter email, then send.
- `notify-project-supported`: Given `support_activity_id` (or equivalent), look up project and owner email, then send.

### Database Queries
- Use Supabase service role inside Edge Functions (via function env) or RLS-safe views with function key to fetch necessary data.

---

## 8. Frontend Changes

### New Components
- Email templates authored with React Email (rendered server-side in Node examples; for Deno Edge Functions we’ll build static HTML templates or small JSX-to-HTML via compatible lib). Initial scope: simple, branded HTML.

### Page Updates
- None required for MVP; ensure deep-links route correctly to project detail and feedback threads.

### State Management
- No client state changes required beyond invoking Edge Functions after successful DB inserts or via DB triggers calling HTTP endpoints.

---

## 9. Implementation Plan

1) Dependencies and Secrets
- Add `resend` npm dependency for local utilities if needed. Edge Functions will call Resend via HTTP or SDK alternative compatible with Deno.
- Store `RESEND_API_KEY` as a Supabase project secret for Edge Functions (do not commit). The provided key will be set in Supabase secrets outside the repo.

2) Edge Functions (Deno)
- Create functions:
  - `supabase/functions/notify-new-feedback/index.ts`
  - `supabase/functions/notify-reply-feedback/index.ts`
  - `supabase/functions/notify-project-supported/index.ts`
- Reuse `supabase/functions/_shared/cors.ts` for CORS.
- Read env via `Deno.env.get('RESEND_API_KEY')`.
- Implement POST handlers accepting minimal IDs, validate input, fetch enriched data, render HTML, send via Resend API.

3) Email Content
- Minimal branded HTML with CTA back to startsnap.fun. Keep copy friendly and concise.
- Subjects:
  - New feedback: "New feedback on ‘{projectTitle}’ on StartSnap"
  - Reply: "Someone replied to your feedback on ‘{projectTitle}’"
  - Support: "Your project ‘{projectTitle}’ just got support!"

4) App Integration
- After creating feedback/reply/support records, invoke the corresponding Edge Function (server-side trigger or client-side call with ID). Prefer server-side trigger functions for reliability; if client invokes, ensure it runs after successful insert.

5) Observability & Errors
- Log function errors to console (Supabase logs). Never log API keys or PII.
- Return structured JSON with status.

6) Testing
- Local: Invoke functions with test IDs that map to seed data.
- Staging: Verify email delivery to a test domain/address.
- Production: Enable gradually.

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Track checkboxes in this doc. Add brief commit messages per function completed and verified.

---

## 11. File Structure & Organization

- `supabase/functions/_shared/cors.ts` (existing)
- `supabase/functions/notify-new-feedback/index.ts`
- `supabase/functions/notify-reply-feedback/index.ts`
- `supabase/functions/notify-project-supported/index.ts`
- Optional: `supabase/functions/_shared/email.ts` for shared HTML builders.

---

## 12. AI Agent Instructions

### Implementation Workflow
- Use Edge Functions to call Resend with env key. Do not place keys in client.
- Follow existing function structure and CORS helper.
- Validate inputs; enrich server-side.
- Keep HTML simple and branded.

### Communication Preferences
- Concise status updates, highlight blockers (e.g., missing domain or from-address).

### Code Quality Standards
- Type-safe TS where possible; small, focused functions; clear naming; JSDoc for exported utilities.

---

## 13. Second-Order Impact Analysis

### Impact Assessment
- Risk: Email spam if duplicate events fire; mitigate with idempotency keys or deduping per event ID.
- Deliverability: Set verified sending domain and proper `from` address in Resend before production.
- Privacy: Ensure only intended recipients receive notifications.
- Latency: Function call adds small overhead; acceptable for notifications.

---

### Notes on Security
- The Resend API key must be configured as a Supabase Edge Function secret (e.g., `RESEND_API_KEY`). Do not commit it to the repo or expose it in client code.

### Next Steps
- Configure Resend domain and sender.
- Implement `notify-new-feedback` first, then the other two.
- Add optional user-level notification preference.


---

## 14. Local and Production Setup Guide (Resend + Supabase Edge Functions)

Follow these steps to implement locally and deploy to the remote Supabase project. This aligns with Resend guidance for Supabase Edge Functions and keeps the API key server-side only.

### A) One-time Resend setup
- Verify your sending domain in Resend (required for deliverability).
- Decide your production From address, e.g., `StartSnap <no-reply@startsnap.fun>`.

### B) Create a minimal test function (already added)
- Path: `supabase/functions/resend-test/index.ts`
- Purpose: Send a simple test email via Resend using the environment secret.

### C) Local development
1. Start local Supabase services:
   ```bash
   supabase start
   ```
2. Create a local env file for functions:
   ```bash
   printf "RESEND_API_KEY=YOUR_KEY_HERE\n" > supabase/.env.local
   ```
   - Do NOT commit this file.
3. Serve Edge Functions locally with env file:
   ```bash
   supabase functions serve --env-file supabase/.env.local
   ```
4. Trigger the test function (default sends to delivered@resend.dev):
   ```bash
   curl -i --location --request POST \
     'http://127.0.0.1:54321/functions/v1/resend-test' \
     --header 'Content-Type: application/json' \
     --data '{"to":"delivered@resend.dev","subject":"Local Test","html":"<strong>Local works!</strong>"}'
   ```

### D) Production secrets and deploy
1. Prepare a production env file (never commit your real key):
   ```bash
   printf "RESEND_API_KEY=YOUR_PROD_KEY_HERE\n" > supabase/.env
   ```
2. Push secrets to your Supabase project:
   ```bash
   supabase secrets set --env-file supabase/.env
   ```
3. Deploy the test function:
   ```bash
   supabase functions deploy resend-test
   ```
4. Invoke in production (replace PROJECT-REF and REGION if needed; you can also call via your Supabase project URL):
   ```bash
   curl -i --location --request POST \
     'https://<PROJECT-REF>.functions.supabase.co/resend-test' \
     --header 'Content-Type: application/json' \
     --data '{"to":"delivered@resend.dev","subject":"Prod Test","html":"<strong>Prod works!</strong>"}'
   ```

### E) Integrate real notification triggers
- After verifying `resend-test`, implement and deploy:
  - `notify-new-feedback`
  - `notify-reply-feedback`
  - `notify-project-supported`
- Each function should read `RESEND_API_KEY` via `Deno.env.get()` and never expose it.
- Prefer passing only IDs from the client; enrich data inside the function.

### F) Operational notes
- Rate limits and retries: consider basic retry on 500-range responses.
- Observability: inspect Supabase function logs for delivery attempts; avoid logging PII or secrets.
- Deliverability: ensure domain/DNS and From address are configured in Resend before go-live.


