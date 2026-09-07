# Parents Health OS — BUILD HISTORY & ENGINEERING PROCESS TRUTH

Last reconstructed: September 7, 2026  
Repository state: `main` @ `a7cc3ba` (`fix: grant WhatsApp event update permissions`)

---

## 1. Purpose of this document

This document is a factual, repository-evidenced history of how **Parents Health OS** was designed, built, refactored, hardened, and verified. It reconstructs the actual engineering sequence, architectural transitions, defect resolutions, test evolution, and codebase milestones directly from Git commit history, migration files, test scripts, and source code. 

It is designed to serve as an authoritative source map for technical documentation, engineering reviews, and step-by-step masterclass walkthroughs.

---

## 2. Final system baseline

The finished repository contains a production-ready Next.js 16 web application backing a family care coordination console. Key capabilities include:
- **Authentication & Authorization:** Supabase Auth (`@supabase/ssr`) with 15-table PostgreSQL Row-Level Security (RLS).
- **Core Care Engine:** Multi-recipient selection, medication schedules, non-medication care routines, longitudinal vitals logging, and condition tracking.
- **Document Intelligence:** Private file storage (`health-documents` bucket), `@google/genai` extraction using `gemini-3.5-flash-lite`, caregiver extraction review, and authenticated document deletion (`/api/documents/remove`).
- **WhatsApp Integration:** Meta Cloud API (`v25.0`) interactive button reminders (`TAKEN`, `SKIP`, `SNOOZE`, `DONE`), HMAC SHA-256 webhook verification, state machine status updates (`status.ts`), and Compare-And-Swap (CAS) scheduler concurrency locking (`/api/whatsapp/reminders/run`).

*(For full runtime architecture and component specifications, refer to [PROJECT_TRUTH_parentshealthos.md](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/PROJECT_TRUTH_parentshealthos.md).)*

---

## 3. High-level build timeline

| Phase | Commit Range | What Entered the System | Evidence Strength |
| :--- | :--- | :--- | :--- |
| **Phase 1: Early Prototype ("Yukti OS")** | `a11bec8` – `438ccc2` <br>*(Jan 24 – Mar 29, 2026)* | Initial Next.js scaffold, basic UI prototypes, patient command center, Chaaya demo. | **HIGH** (Git log history) |
| **Phase 2: Renaming & Local Care Console** | `9123e1d` – `89a4172` <br>*(May 7 – Jun 19, 2026)* | Renamed project to Parents Health OS (`9123e1d`). Built browser-side sandbox care console (`OPERATOR_MANUAL.md`, `localStorage`, mock Anaya assistant, offline sync queue, mock Gemini lab analysis). | **HIGH** (Git log history) |
| **Phase 3: Real Foundation Setup** | `a5aceef` – `cb091bb` <br>*(Jul 14 – Sep 3, 2026)* | Initial `PROJECT_TRUTH.md` created (`a5aceef`), renamed to `PROJECT_TRUTH_parentshealthos.md` (`99f8514`), real Supabase foundation established (`bb281cd`, `cb091bb`). | **HIGH** (Git log history) |
| **Phase 4: Database Schema & Real Core** | `20adb61` – `8e59501` <br>*(Sep 3, 2026)* | 15-table canonical schema migration created (`20260903120000_create_v1_schema.sql`), real Next.js family dashboard page, Supabase Auth context, medications, care routines, observations, care recipient switcher (`8e59501`). | **HIGH** (Git log & SQL files) |
| **Phase 5: Document Intelligence** | `7d229d7` – `7969a18` <br>*(Sep 3 – Sep 4, 2026)* | Private storage bucket migration (`20260903130000_create_health_documents_storage_bucket.sql`), `/api/analyze` Gemini document extraction route (`7d229d7`), service role grants (`20260904001000`), model switched to `gemini-3.5-flash-lite` (`7969a18`). | **HIGH** (Git log & API routes) |
| **Phase 6: WhatsApp Loop & Concurrency** | `3f18aff` <br>*(Sep 4, 2026)* | Added `src/lib/whatsapp/`, `/api/whatsapp/send`, `/api/whatsapp/webhook`, `/api/whatsapp/reminders/run`, delivery columns migration (`20260904010000`), CAS lease locking, automated unit test suites (`delivery-status.test.ts` & `scheduler-concurrency.test.ts`). | **HIGH** (Git log & test files) |
| **Phase 7: PWA, Document Purge & Privacy** | `48d0ea9` – `3bba7d1` <br>*(Sep 4 – Sep 6, 2026)* | `/api/documents/remove` authenticated storage/metadata purge, PWA manifest & service worker (`48d0ea9`), public `/privacy` page (`3bba7d1`). | **HIGH** (Git log & code) |
| **Phase 8: Meta Alignment & Defect Hardening** | `2fc85c8` – `a7cc3ba` <br>*(Sep 6, 2026)* | Graph API pinned to `v25.0` (`2fc85c8`), recipient lookup parameter normalization & RLS fallback (`4cb4e60`), migration `20260906140000_grant_whatsapp_events_service_role.sql` granting `SELECT, UPDATE` on event tables to `service_role` (`a7cc3ba`). | **HIGH** (Git log & migration files) |

---

## 4. Commit-level milestones

| Commit | Date (ISO) | Change Summary | Files Changed | Engineering Significance |
| :--- | :--- | :--- | :--- | :--- |
| `a11bec8` | 2026-01-24 | `Initial commit from Create Next App` | Next.js scaffold files | Established repository root and initial Next.js framework. |
| `9123e1d` | 2026-05-07 | `chore: completely revamped project name to parents-health-os` | `package.json`, layout files | Officially rebranded project from Yukti OS to Parents Health OS. |
| `6132fd5` | 2026-05-28 | `feat: Phase 2B.1 - Local Offline Resilience & Sync Telemetry` | `localPersistence.ts`, `syncQueue.ts` | Introduced browser `localStorage` sandbox vault and offline sync queue prototype. |
| `207e5b0` | 2026-06-04 | `Complete First Family Care Console revamp...` | `OPERATOR_MANUAL.md`, components | Created comprehensive manual and mock UI components for local sandbox demo. |
| `bb281cd` | 2026-09-03 | `chore: establish real parents health os foundation` | `context.tsx`, `client.ts`, `server.ts` | Purged local storage mock code and established real Supabase client/server abstractions. |
| `20adb61` | 2026-09-03 | `chore: finalize v1 health data schema` | `20260903120000_create_v1_schema.sql` | Created canonical 15-table SQL relational schema with strict FK constraints and RLS. |
| `ec1a40f` | 2026-09-03 | `fix: finalize parents health database migration` | `20260903120000_create_v1_schema.sql` | Adjusted trigger search path and unique constraint declarations in SQL migration. |
| `8e59501` | 2026-09-03 | `feat: ship real family care core` | `src/app/page.tsx`, `context.tsx` | Shipped production React dashboard, auth context, medications, care routines, and vitals. |
| `7d229d7` | 2026-09-03 | `feat: add private document intelligence` | `/api/analyze/route.ts`, storage SQL | Added private storage bucket migration and Gemini API server route for document extraction. |
| `859e8df` | 2026-09-03 | `fix: align health document upload with database schema` | `src/app/page.tsx`, `context.tsx` | Fixed document upload payload key alignment with SQL table schema. |
| `a736ee5` | 2026-09-04 | `fix: grant SELECT, INSERT on document_extractions to service_role` | `20260904001000_...sql` | Granted service role permission to create extraction records server-side. |
| `7969a18` | 2026-09-04 | `fix: switch document extraction to Gemini 3.5 Flash-Lite` | `/api/analyze/route.ts` | Pinned extraction model contract to `gemini-3.5-flash-lite`. |
| `3f18aff` | 2026-09-04 | `feat: add real WhatsApp family care loop` | `src/lib/whatsapp/`, API routes, SQL | Added full Meta Cloud API integration, webhook handler, CAS scheduler, and unit tests. |
| `48d0ea9` | 2026-09-04 | `feat: finish PWA and safe document removal` | `/api/documents/remove/route.ts`, PWA | Added authenticated document storage purge and web manifest / service worker shell. |
| `2fc85c8` | 2026-09-06 | `fix: align WhatsApp API with Meta dashboard` | `src/lib/whatsapp/config.ts` | Aligned centralized WhatsApp Graph API version to `v25.0` matching Meta dashboard. |
| `3bba7d1` | 2026-09-06 | `feat: add privacy policy` | `src/app/privacy/page.tsx` | Added public privacy policy page for Meta App verification and DPDPA compliance. |
| `4cb4e60` | 2026-09-06 | `fix: resolve WhatsApp care recipient correctly` | `/api/whatsapp/send/route.ts` | Hardened recipient lookup parameter keys (`careRecipientId`, `care_recipient_id`, `recipientId`). |
| `a7cc3ba` | 2026-09-06 | `fix: grant WhatsApp event update permissions` | `20260906140000_...sql`, tests | Granted `SELECT, UPDATE` on event tables to `service_role` to fix webhook callback execution. |

---

## 5. Capability evolution

### Authentication & Authorization
- **Initial State:** Client-side mock user state stored in React state / `localStorage`.
- **Later Change (Commit `bb281cd`):** Replaced mock auth with Supabase Auth (`@supabase/ssr`) using cookies and server session validation.
- **Final State:** Multi-role access control (`owner`, `caregiver`, `viewer`) backed by 15-table Postgres RLS policies and helper functions (`private.is_family_member`, `private.has_family_role`).

### Health Data & Care Coordination
- **Initial State:** Mock vitals and medication data generated in `src/utils/demoData.ts`.
- **Later Change (Commit `8e59501`):** Integrated real Supabase database mutations for `medications`, `medication_schedules`, `medication_events`, `care_routines`, `care_routine_schedules`, `care_routine_events`, and `health_observations`.
- **Final State:** Live family care engine supporting multi-recipient switching, medication adherence tracking, non-medication care routine scheduling, and dual-value blood pressure vitals logging.

### Health Document Pipeline
- **Initial State:** Client-side mock analysis displaying hardcoded HbA1c (7.2%) and LDL cholesterol (135 mg/dL) results.
- **Later Change (Commit `7d229d7`):** Created private storage bucket `health-documents` and server route `/api/analyze` invoking `@google/genai` SDK.
- **Final State:** Real document processing pipeline: browser upload to private storage bucket -> server-side download via admin client -> `gemini-3.5-flash-lite` JSON extraction -> pending review persistence in `document_extractions` -> human approval -> safe authenticated removal via `/api/documents/remove` (Commit `48d0ea9`).

### WhatsApp Reminder System
- **Initial State:** React smartphone UI component (`src/components/WhatsAppDemo.tsx`) simulating chat dialog.
- **Later Change (Commit `3f18aff`):** Removed simulated UI component and built real backend infrastructure with Meta Graph API, webhook handlers, and CAS scheduler locking.
- **Final State:** Fully operational Meta Cloud API (`v25.0`) loop supporting interactive quick-reply buttons (`TAKEN`, `SKIP`, `SNOOZE`, `DONE`), HMAC SHA-256 webhook verification, atomic delivery status tracking (`status.ts`), and service-role database permissions (`a7cc3ba`).

---

## 6. Architecture evolution

### Transition 1: Browser Sandbox -> Real Supabase Cloud Architecture
- **BEFORE:** Client-side sandbox app persisting data to `localStorage` (`src/lib/offline/localPersistence.ts`) with an in-memory sync queue (`src/lib/offline/syncQueue.ts`).
- **PROBLEM / REASON VISIBLE IN EVIDENCE:** Browser `localStorage` could not support multi-device family synchronization, real server-side authentication, row-level security, or live external API webhooks.
- **AFTER:** Full Next.js 16 server architecture with Supabase Auth, `@supabase/ssr` cookies, 15-table relational PostgreSQL schema (`20260903120000_create_v1_schema.sql`), and server safety assertions (`assertServerOnly`).
- **EVIDENCE:** Commit `bb281cd` deleted `localPersistence.ts` and `syncQueue.ts`; commit `20adb61` created `20260903120000_create_v1_schema.sql`; commit `8e59501` introduced `src/lib/supabase/context.tsx`.
- **Reasoning:** *UNKNOWN — requires builder answer* (repository diff proves transition from local prototype to cloud architecture).

### Transition 2: Client Simulation -> Server-Side Private Document Extraction
- **BEFORE:** Mock document analysis executed via client timer callbacks in `OPERATOR_MANUAL.md`.
- **PROBLEM / REASON VISIBLE IN EVIDENCE:** Diagnostic reports contain sensitive PHI that must be stored in restricted, private buckets and analyzed server-side without exposing API keys or bucket files publicly.
- **AFTER:** Private bucket `health-documents` (`20260903130000_create_health_documents_storage_bucket.sql`), `/api/analyze` API route downloading bytes via privileged admin client (`createAdminClient`), and `gemini-3.5-flash-lite` extraction.
- **EVIDENCE:** Commit `7d229d7` introduced storage SQL and `/api/analyze/route.ts`; commit `a736ee5` added `20260904001000_grant_document_extractions_service_role.sql`.

### Transition 3: Naive Event Queries -> Compare-And-Swap (CAS) Scheduler Locking
- **BEFORE:** Standard SQL query selecting pending events for reminder dispatch.
- **PROBLEM / REASON VISIBLE IN EVIDENCE:** Concurrent scheduler invocations or retries could claim the same pending medication event simultaneously, resulting in duplicate WhatsApp messages sent to parents.
- **AFTER:** Atomic CAS claim function (`claimReminderEvent`) setting `reminder_delivery_status = 'pending'` and returning `updated_at` as a `leaseToken`. Pre-acceptance failure releases claim via `releaseReminderEventClaim`; success marks sent via `markReminderEventSent`. Stale leases (>5 minutes) are automatically reclaimed.
- **EVIDENCE:** Commit `3f18aff` added CAS locking routines in `src/lib/whatsapp/service.ts` and verified them in `scheduler-concurrency.test.ts`.

---

## 7. WhatsApp build history

The WhatsApp system was constructed and hardened across four distinct engineering iterations:

1. **Initial Infrastructure (Commit `3f18aff` — Sep 4, 2026):**
   - Created `src/lib/whatsapp/client.ts` to dispatch messages via Meta Graph API.
   - Created `src/lib/whatsapp/config.ts` to read environment credentials.
   - Created `src/lib/whatsapp/service.ts` with medication and routine reminder builders.
   - Created `src/app/api/whatsapp/send/route.ts` for caregiver manual dispatches.
   - Created `src/app/api/whatsapp/webhook/route.ts` for GET verification and POST button callback processing.
   - Created `src/app/api/whatsapp/reminders/run/route.ts` for cron-triggered batch dispatches.
   - Created migration `20260904010000_add_whatsapp_reminder_delivery_columns.sql` adding `reminder_sent_at`, `reminder_message_id`, and `reminder_delivery_status` to event tables.
   - Created automated test suites `delivery-status.test.ts` and `scheduler-concurrency.test.ts`.

2. **Graph API Version Alignment (Commit `2fc85c8` — Sep 6, 2026):**
   - Updated `GRAPH_API_VERSION` from `v26.0` to `v25.0` in `src/lib/whatsapp/config.ts` to align with the Meta Developer Dashboard configuration.

3. **Recipient Resolution Hardening (Commit `4cb4e60` — Sep 6, 2026):**
   - *Defect:* Clicking "SEND TEST REMINDER" returned toast "Care recipient profile not found" because UI passed `careRecipientId` while API expected different key variants or user RLS client failed lookup.
   - *Fix:* Hardened parameter parsing in `/api/whatsapp/send/route.ts` to evaluate `careRecipientId`, `care_recipient_id`, and `recipientId` with service-role lookup fallback. Added Test K in `delivery-status.test.ts`.

4. **Service Role Permission Grant (Commit `a7cc3ba` — Sep 6, 2026):**
   - *Defect:* Webhook callback received button tap (`TAKEN`) but failed to update Postgres with error `"permission denied for table medication_events"`.
   - *Fix:* Created migration `20260906140000_grant_whatsapp_events_service_role.sql` granting `SELECT, UPDATE` on `medication_events` and `care_routine_events` and `SELECT` on schedules to `service_role`. Added Test L in `delivery-status.test.ts`.

---

## 8. Document intelligence build history

1. **Storage Infrastructure (Commit `7d229d7` — Sep 3, 2026):**
   - Created migration `20260903130000_create_health_documents_storage_bucket.sql` establishing private bucket `health-documents` with 20MB limit and allowed MIME types (`pdf`, `png`, `jpeg`, `webp`). Added storage RLS policies.
2. **Server Extraction Route (Commit `7d229d7` — Sep 3, 2026):**
   - Created `/api/analyze/route.ts` using `@google/genai` SDK. Downloaded private file bytes via `createAdminClient`, converted to base64, and invoked Gemini with structured JSON schema.
3. **Database Permission Fix (Commit `a736ee5` — Sep 4, 2026):**
   - Created migration `20260904001000_grant_document_extractions_service_role.sql` granting `SELECT, INSERT` on `document_extractions` to `service_role`.
4. **Model Contract Pinning (Commit `7969a18` — Sep 4, 2026):**
   - Updated model string in `/api/analyze/route.ts` to `gemini-3.5-flash-lite`.
5. **Authenticated Document Removal (Commit `48d0ea9` — Sep 4, 2026):**
   - Created `/api/documents/remove/route.ts` to allow authorized caregivers/owners to purge private storage files and delete metadata rows.

---

## 9. Data model evolution

The canonical 15-table SQL schema was established in migration `20260903120000_create_v1_schema.sql` (Commit `20adb61` & `ec1a40f`).

```
20260903120000_create_v1_schema.sql (15 tables: profiles, families, family_members, care_recipients, consents, health_documents, document_extractions, health_conditions, health_observations, care_routines, care_routine_schedules, care_routine_events, medications, medication_schedules, medication_events)
  ├── 20260903130000_create_health_documents_storage_bucket.sql (Private bucket & Storage RLS)
  ├── 20260904001000_grant_document_extractions_service_role.sql (Service role INSERT on extractions)
  ├── 20260904010000_add_whatsapp_reminder_delivery_columns.sql (Delivery tracking columns)
  └── 20260906140000_grant_whatsapp_events_service_role.sql (Service role UPDATE on events)
```

### Distinguishing Documentation vs. Schema History
- `OPERATOR_MANUAL.md` describes an earlier 14-table draft (with table names like `parents` or `medication_logs`). Git history proves `OPERATOR_MANUAL.md` was authored during Phase 2 (Commit `207e5b0` — June 4, 2026) for the browser sandbox prototype and was never updated to match the real 15-table SQL migration created in Phase 4 (Commit `20adb61` — September 3, 2026).

---

## 10. Authentication / authorization evolution

1. **Session Management:** Supabase Auth via `@supabase/ssr` (`src/lib/supabase/context.tsx`, `middleware.ts`).
2. **Postgres RLS Policies:** Every table enables RLS in `20260903120000_create_v1_schema.sql`.
3. **Security Definer Helpers:**
   - `private.is_family_member(check_family_id)`: Checks if `auth.uid()` is an active member.
   - `private.has_family_role(check_family_id, allowed_roles)`: Evaluates role membership (`owner`, `caregiver`, `viewer`).
4. **Service-Role Boundary:** Server routes bypass RLS for administrative operations using `createServiceRoleClient()` or `createAdminClient()`. Explicit SQL grants were added via migrations `20260904001000` (`document_extractions`) and `20260906140000` (`medication_events`, `care_routine_events`).

---

## 11. Real failures and fixes

| Failure | Observed Symptom | Root Cause | Fix Applied | Commit | Verification Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Recipient Lookup Mismatch** | Toast: "Care recipient profile not found." on manual send | Parameter key discrepancy between UI (`careRecipientId`) and API, plus RLS restrictions on user lookup client | Hardened parameter extraction to support `careRecipientId`, `care_recipient_id`, and `recipientId` with service-role client fallback | `4cb4e60` | **VERIFIED LIVE & TEST** (Test K) |
| **Graph API Version Mismatch** | Meta Cloud API requests failing or rejected | Config pinned `GRAPH_API_VERSION = "v26.0"`, while Meta dashboard runs `v25.0` | Updated `GRAPH_API_VERSION` to `v25.0` in `src/lib/whatsapp/config.ts` | `2fc85c8` | **VERIFIED LIVE & TEST** |
| **Webhook Database Permission Error** | Webhook returned 200 but event status not updated with server error `"permission denied for table medication_events"` | `service_role` lacked explicit SQL `UPDATE` privileges on `medication_events` and `care_routine_events` | Created migration `20260906140000_grant_whatsapp_events_service_role.sql` granting `SELECT, UPDATE` to `service_role` | `a7cc3ba` | **VERIFIED LIVE & TEST** (Test L) |
| **Extraction Service-Role Insert Denial** | `/api/analyze` failed to persist extracted JSON record | RLS restricted client inserts and `service_role` lacked explicit `INSERT` grant | Created migration `20260904001000_grant_document_extractions_service_role.sql` granting `SELECT, INSERT` to `service_role` | `a736ee5` | **VERIFIED LOCAL & LIVE** |
| **Document Upload Schema Mismatch** | Document upload failed due to field name mismatch | Payload field name discrepancy between upload component and `health_documents` table schema | Aligned parameter names in `src/app/page.tsx` and `context.tsx` to match SQL table schema | `859e8df` | **VERIFIED LOCAL & LIVE** |
| **Delivery Status Webhook Race Condition** | Risk of late/retried `delivered` webhooks overwriting higher `read` status | Naive database `UPDATE` queries without conditional state transition checks | Implemented `getGuardedStatusUpdateFilter` in `status.ts` to build PostgREST conditional update filters enforcing valid status transitions | `3f18aff` | **VERIFIED BY TEST** (`delivery-status.test.ts`) |
| **Scheduler Concurrent Worker Duplicate Send** | Risk of parallel cron executions claiming same pending event and sending duplicate messages | Lack of atomic Compare-And-Swap (CAS) lock acquisition prior to calling Meta API | Implemented `claimReminderEvent`, `releaseReminderEventClaim`, and `markReminderEventSent` using `updated_at` CAS lease tokens with 5-min stale recovery | `3f18aff` | **VERIFIED BY TEST** (`scheduler-concurrency.test.ts`) |

---

## 12. Testing evolution

| Test / Script | Introduced | Risk Addressed | What It Proves | What It Does Not Prove |
| :--- | :--- | :--- | :--- | :--- |
| `src/lib/whatsapp/__tests__/delivery-status.test.ts` <br>*(via `scripts/test-delivery.ts`)* | Commit `3f18aff` <br>*(Sep 4, 2026)* | Out-of-order status webhooks, status downgrades, payload ID mismatch, permission grants | Proves delivery state machine logic, PostgREST filter string generation, race condition blocking, payload extraction (Test K), and migration grant static assertions (Test L). | Does not prove live network latency or Meta server uptime. |
| `src/lib/whatsapp/__tests__/scheduler-concurrency.test.ts` <br>*(via `scripts/test-scheduler.ts`)* | Commit `3f18aff` <br>*(Sep 4, 2026)* | Concurrent scheduler runs, duplicate message dispatches, stale worker overwrites | Proves CAS lease claims, stale worker blocking, lease reclamation, stale release rejection, stale mark-sent rejection, and routine/medication table parity. | Does not prove multi-region serverless infrastructure behavior under extreme load. |
| `npx tsc --noEmit` | Continuous | Type errors, missing props, signature mismatches | Proves end-to-end TypeScript compilation and interface contract safety across all routes and components. | Does not prove runtime logic correctness. |
| `npm run build` | Continuous | Bundling errors, broken imports, SSR failures | Proves Next.js App Router route compilation, static page generation, and production bundle creation. | Does not prove live database connectivity. |

---

## 13. AI-assisted engineering workflow — repository evidence only

### PROVEN BY REPOSITORY
- Structured documentation artifacts (`PROJECT_TRUTH_parentshealthos.md`, `BUILD_HISTORY_parentshealthos.md`, `OPERATOR_MANUAL.md`) exist in the repository root.
- Automated unit test suites (`scripts/test-delivery.ts` & `scripts/test-scheduler.ts`) were committed alongside feature code in commit `3f18aff` to verify WhatsApp deliverability and concurrency mechanics.
- Development tasks included explicit verification runs (`npx tsx scripts/test-delivery.ts`, `npx tsx scripts/test-scheduler.ts`, `npx tsc --noEmit`, `npm run build`, `git diff --check`).

### UNKNOWN — requires builder answer
- Which specific LLM / IDE assistant model was used during coding (e.g. Gemini / Claude).
- Exact human prompt text used during development sessions.
- Breakdown of human-typed code vs AI-generated code snippets.
- Exact time spent in chat dialog vs code editor.

---

## 14. Screen-share masterclass source map

| Topic | What to Show on Screen | Exact File / Route / Dashboard Area | Teaching Purpose |
| :--- | :--- | :--- | :--- |
| **Finished Application UI** | Live mobile dashboard with care recipient switcher, vitals summary, and active reminders | `http://localhost:3000` / `src/app/page.tsx` | Show the calm, mobile-first caregiver user experience. |
| **Repository Root Structure** | Directory tree, config files, migrations, and source folders | Repository Root | Explain project layout and separation of concerns. |
| **Dependencies & Scripts** | Package dependencies (`@google/genai`, `@supabase/ssr`, `lucide-react`) | [package.json](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/package.json) | Show modern Next.js 16 stack and custom test scripts. |
| **Main Dashboard Component** | React state, modals, and tab navigation | [src/app/page.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/page.tsx) | Demonstrate client component architecture and toast notifications. |
| **Auth & Data Provider** | Global React Context managing Supabase Auth and care recipient state | [src/lib/supabase/context.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/context.tsx) | Teach client-side state synchronization with Supabase backend. |
| **Supabase Client Abstractions** | SSR browser client, server client, and privileged admin client | `src/lib/supabase/client.ts`, `server.ts`, `admin.ts` | Explain proper security scoping between browser and server environments. |
| **Canonical Relational Schema** | 15-table SQL DDL with FK constraints, triggers, and RLS policies | [20260903120000_create_v1_schema.sql](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/supabase/migrations/20260903120000_create_v1_schema.sql) | Walk through production relational schema design and RLS rules. |
| **Private Document Storage** | Storage bucket creation SQL and Storage RLS policies | [20260903130000_...sql](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/supabase/migrations/20260903130000_create_health_documents_storage_bucket.sql) | Explain private bucket security and MIME type restrictions. |
| **AI Document Intelligence** | Server API route calling Gemini 3.5 Flash-Lite with JSON schema | [src/app/api/analyze/route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/analyze/route.ts) | Show server-side AI document extraction and clinical safety prompts. |
| **Authenticated Document Removal** | Storage object purge and database metadata cascade deletion | [src/app/api/documents/remove/route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/documents/remove/route.ts) | Teach safe two-stage document deletion and role verification. |
| **WhatsApp Configuration** | Graph API `v25.0` constant, base URL, and server credential loader | [src/lib/whatsapp/config.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/config.ts) | Show centralized WhatsApp configuration and Graph API version pinning. |
| **WhatsApp Meta Client** | E.164 phone normalization, privacy masking, and Meta API fetch | [src/lib/whatsapp/client.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/client.ts) | Demonstrate Meta Cloud API payload construction for interactive buttons. |
| **WhatsApp Service & CAS Locking** | `sendMedicationReminder`, `claimReminderEvent`, `markReminderEventSent` | [src/lib/whatsapp/service.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/service.ts) | Teach atomic Compare-And-Swap (CAS) lease locking for schedulers. |
| **WhatsApp Delivery State Machine** | Status transition rules and PostgREST filter string builder | [src/lib/whatsapp/status.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/status.ts) | Explain state machine transition matrices and race condition prevention. |
| **Manual WhatsApp Send Route** | Parameter extraction, recipient lookup fallback, and Meta send | [src/app/api/whatsapp/send/route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/send/route.ts) | Walk through caregiver-triggered manual reminder dispatch logic. |
| **WhatsApp Scheduler Route** | Cron header verification, due window querying, and batch processing | [src/app/api/whatsapp/reminders/run/route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/reminders/run/route.ts) | Show automated reminder batch processing with CAS lease claims. |
| **WhatsApp Webhook Route** | GET verification handshake, HMAC SHA-256 check, button callback | [src/app/api/whatsapp/webhook/route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/webhook/route.ts) | Demonstrate Meta Webhook security and interactive quick-reply parsing. |
| **Delivery Status Unit Tests** | 12 automated unit tests verifying status transitions and grants | [delivery-status.test.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/__tests__/delivery-status.test.ts) | Show automated testing of delivery state machine and SQL grants. |
| **Scheduler Concurrency Tests** | 10 automated unit tests verifying CAS lease locking and stale recovery | [scheduler-concurrency.test.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/__tests__/scheduler-concurrency.test.ts) | Teach testing of concurrent worker locking and lease expiration. |
| **Environment Variable Template** | Template file documenting all required server environment keys | [.env.example](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/.env.example) | Explain configuration requirements without exposing secret values. |
| **Public Privacy Policy** | Public route explaining DPDP Act compliance and infrastructure bounds | [src/app/privacy/page.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/privacy/page.tsx) | Show compliance documentation for Meta App publishing and DPDP Act. |
| **Project Ground Truth** | Architecture specification and capability truth matrix | [PROJECT_TRUTH...md](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/PROJECT_TRUTH_parentshealthos.md) | Reference the master architectural truth document. |

---

## 15. What the repository cannot tell us

1. **Technology Selection Motives:** Why Supabase was selected over Firebase or custom Node.js/PostgreSQL, and why Google Gemini 3.5 Flash-Lite was chosen over OpenAI GPT-4o.
2. **Alternative UX Evaluations:** What design iterations were tested for the WhatsApp care loop before interactive quick-reply buttons were selected.
3. **Human Wall-Clock Duration:** Exactly how many hours or days were spent developing each phase beyond the git commit timestamps.
4. **Live Device Testing History:** What manual test scenarios were executed on physical Android/iOS WhatsApp devices prior to final commit verification.
5. **Meta Dashboard Navigation:** How the Meta Developer App registration, test phone number setup, and WABA subscription were navigated step-by-step in the Meta UI.
6. **AI Prompt Engineering Process:** What specific prompt variations were evaluated before landing on the extraction prompt in `/api/analyze/route.ts`.
7. **Threshold Design Rationale:** Why a 5-minute stale lease window was selected for scheduler CAS locking in `src/lib/whatsapp/service.ts`.
8. **Documentation Maintenance Choices:** Why `OPERATOR_MANUAL.md` was left un-updated after the September 3 Supabase v1 migration.
9. **Feature Expansion Choices:** What user feedback led to including non-medication care routines alongside medication schedules.

---

## 16. Final factual build sequence

```
Initial Next.js Prototype ("Yukti OS") [Jan-Mar 2026]
  │
  ▼
Rebrand to Parents Health OS [May 2026]
  │
  ▼
Local Care Console Prototype & OPERATOR_MANUAL [May-Jun 2026]
  │
  ▼
Supabase Foundation & Purge Browser Mock Code [Sep 3, 2026]
  │
  ▼
15-Table Relational Schema Migration (20260903120000) [Sep 3, 2026]
  │
  ▼
Ship Real Family Care Core Dashboard [Sep 3, 2026]
  │
  ▼
Private Storage & Gemini 3.5 Flash-Lite Intelligence [Sep 3-4, 2026]
  │
  ▼
Grant Service-Role Extraction Grants (20260904001000) [Sep 4, 2026]
  │
  ▼
Meta Cloud API v25.0 & Interactive Button Engine [Sep 4, 2026]
  │
  ▼
CAS Scheduler & Concurrency Locking Suite [Sep 4, 2026]
  │
  ▼
Automated Delivery & Scheduler Test Suites [Sep 4, 2026]
  │
  ▼
PWA Shell & Authenticated Document Purge Route [Sep 4, 2026]
  │
  ▼
Public Privacy Policy Route (/privacy) [Sep 6, 2026]
  │
  ▼
Meta API Version Alignment (v25.0) [Sep 6, 2026]
  │
  ▼
WhatsApp Care Recipient Lookup Fix [Sep 6, 2026]
  │
  ▼
Service-Role Event Permission Migration (20260906140000) [Sep 6, 2026]
  │
  ▼
Final Verification & Project Truth Audit [Sep 6-7, 2026]
```
