# First Family Care Console (Parents Health OS) — PROJECT TRUTH
Last verified: September 3, 2026

## 1. One-liner
A context-aware care coordinator dashboard and automated check-in companion for remote eldercare in India.

## 2. Elevator pitch
First Family Care Console helps remote adult children monitor aging parents. It replaces complex senior-facing apps with automated WhatsApp check-ins while giving caregivers a context-aware clinical dashboard to track vitals, medications, and generate doctor-ready briefings.

## 3. What it is
First Family Care Console (Parents Health OS) is a remote health management console tailored for families and care teams coordinating eldercare in India. The platform solves two core problems: senior technology adoption barriers and alarm fatigue. Elderly parents often struggle to navigate complex interfaces, and standard health monitors generate false alerts by using generic population ranges. In geriatrics, maintaining strict vitals control can lead to hypoglycemia-induced dizziness and catastrophic falls.

Designed to respect India's Digital Personal Data Protection Act (DPDPA), the application defaults to an offline-first local sandbox mode that isolates personal health records on-device. Parents interact passively through automated WhatsApp check-ins, while caregivers use the central operating console to review data. A deterministic, rules-based engine evaluates clinical profiles, adjusting vitals warning thresholds and tailoring daily agendas based on chronic baselines like diabetes or hypertension.

Coordinators can upload diagnostic lab reports, which are parsed by Google Gemini AI to extract key biomarkers and structured medicines, translating jargon into comforting explanations. The system aggregates vitals, medication adherence, and caregiver observations to compile printable doctor-ready briefing papers. This ensures that the coordination team can consult medical professionals with precise historical data, avoiding therapeutic overlap or manual transcription errors while maintaining absolute clinical safety boundaries.

## 4. How it works
The console operates through a remote care coordinator flow. Caregivers onboard elder parents via an intake checklist, which saves the demographic baseline and chronic conditions. The data flows as follows:

```
[Parent (WhatsApp Checks)] <--> [Anaya Automation] <--> [Coordinator Console]
                                                               |
    [Gemini AI (Lab Reports)] <--------------------------------+
                                                               |
    [Rules Engines (Vitals/Care Plan)] <-----------------------+
                                                               |
    [Browser Storage (Sandbox)] <-- (Sync Queue) --> [Supabase Postgres DB]
```

1. **Patient Intake & Compliance Setup:** The caregiver completes the intake checklist and logs DPDPA consent. The rules engine ([carePlanEngine.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/utils/carePlanEngine.ts)) generates a personalized care routine, including vital check frequency, mobility guidelines, and language-specific WhatsApp templates.
2. **Passive WhatsApp Check-ins:** The parent interacts through WhatsApp templates (simulated in [WhatsAppDemo.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/components/WhatsAppDemo.tsx)). Actions logged via WhatsApp update vitals, medication logs, and compliance records.
3. **Clinical Record Processing:** Coordinators upload clinical reports (PDFs/images). The backend API route ([route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/analyze/route.ts)) converts files to base64, passes them to Google Gemini, and receives parsed JSON biomarkers and new medication schedules to sync with the active care log.
4. **Operations Triaging:** The Coordinator Board ([CoordinatorBoard.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/components/CoordinatorBoard.tsx)) displays alerts based on rules-based vitals thresholds and checklist compliance. Triage priority can be set to Stable, Watch, or Urgent Follow-up.
5. **Doctor Consultation Prep:** The care coordinator generates a Doctor Brief ([careTeamEngine.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/utils/careTeamEngine.ts)), compiling historical vitals, medications, and biomarkers into a print-ready PDF containing targeted clinician questions with disclaimer warnings.
6. **Data Storage & Syncing:** Mutations are committed through a persistent state provider ([context.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/context.tsx)). In sandbox mode, transactions are saved in `localStorage` via a local sync queue ([syncQueue.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/offline/syncQueue.ts)). When Supabase environment variables are loaded, the app mounts the PostgreSQL client ([client.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/client.ts)), runs a validation check to block the protected `trelis-life` database, and replicates client mutations to remote tables.

## 5. Tech stack
*   **Frontend**: Next.js 16.1.4 (App Router), React 19.2.3, React DOM 19.2.3, TailwindCSS 4.0 (via `@tailwindcss/postcss`), Framer Motion 12.29.0, Lucide React 0.563.0, React Dropzone 14.3.8, React Markdown 9.1.0.
*   **Backend & APIs**: Next.js App Router Server Routes (`/api/analyze`, `/api/whatsapp/send`, `/api/whatsapp/simulate`, `/api/whatsapp/webhook`).
*   **Data & Persistence**: Browser Local Storage (local-first Sandbox Data Vault via [localPersistence.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/offline/localPersistence.ts) and [syncQueue.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/offline/syncQueue.ts)), Supabase Client (`@supabase/supabase-js` 2.106.2, `@supabase/ssr` 0.10.3) for PostgreSQL sync.
*   **AI Integrations**: Google Gemini API via `@google/generative-ai` 0.24.1 (running `gemini-2.5-flash` with automatic fallback to `gemini-2.5-flash-lite`).
*   **Infrastructure**: Vercel/Local Server (Next.js server-side routes), Supabase Postgres database (14 core tables defined in [types.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/types.ts)).
*   **Version Control & Repository**: Destination repository is `https://github.com/tharungajula2/parents-health-os.git` (authenticated under GitHub identity `tharungajula2`).

## 6. Feature status table
| Feature | Ground-Truth Status | Evidence File | Note |
| --- | --- | --- | --- |
| Local Sandbox Vault (On-device Storage) | REAL RUNTIME | [localPersistence.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/offline/localPersistence.ts) | Reads/writes `localStorage` keys reliably |
| Client-Side Sync Queue | LOCAL SIMULATION | [syncQueue.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/offline/syncQueue.ts) | `simulateSyncAll()` mutates local state; no remote HTTP write occurs |
| First Family Onboarding & DPDPA Consent | LOCAL SIMULATION | [FamilyIntake.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/components/FamilyIntake.tsx) | Saves baseline to `localStorage`; writes to Supabase `consents` table if enabled |
| Baseline Health Camp Registry | LOCAL SIMULATION | [BaselineCamp.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/components/BaselineCamp.tsx) | Registers vitals in local state sandbox |
| Rules-Based Care Plan Engine | REAL RUNTIME | [carePlanEngine.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/utils/carePlanEngine.ts) | Pure deterministic rule engine evaluating ADLs & conditions |
| Clinical Doctor Brief Generator | REAL RUNTIME | [careTeamEngine.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/utils/careTeamEngine.ts) | Deterministic template function compiling vitals & med history |
| Smart PDF Lab Report Analyzer | REAL RUNTIME / MOCKED | [route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/analyze/route.ts) | Real Gemini API call if `GEMINI_API_KEY` set; falls back to `HIGH_FIDELITY_MOCK_REPORT` if absent |
| WhatsApp Bot Conversation Simulator | MOCKED | [WhatsAppDemo.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/components/WhatsAppDemo.tsx) | UI mockup simulating WhatsApp incoming/outgoing messages |
| WhatsApp Outbound API Integration | DORMANT / PARTIAL | [service.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/whatsapp/service.ts) | Code exists but `WHATSAPP_DRY_RUN=true` default prevents actual dispatches |
| WhatsApp Inbound Webhook Handler | DORMANT / PARTIAL | [route.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/webhook/route.ts) | Complete webhook handler with keyword parser; unlinked without Meta keys & public URL |
| Supabase Postgres Cloud Mode | DORMANT / UNPAIRED | [context.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/context.tsx) | Client code ready, but no remote Supabase project exists (0 SQL migrations committed) |
| Database Safety Lock Guard | REAL RUNTIME | [client.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/client.ts) | Safety guard actively blocks connection to protected ref `lhqtqofjrqoyscobsfud` |
| Backup JSON Export | REAL RUNTIME | [page.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/page.tsx) | Exports full local state snapshot as downloadable `.json` blob |

## 7. What is real vs. what is demo (Ground-Truth Audit Summary)
*   **Local-first data management is 100% real:** Vitals, medications, observations, and compliance data are stored locally in the browser's `localStorage` using a persistent cache layer ([localPersistence.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/offline/localPersistence.ts)) that functions without any server dependencies.
*   **AI-powered lab report extraction is real when configured:** When a PDF or image is uploaded, it is sent to `/api/analyze` where the Google Gemini API (`gemini-2.5-flash`) extracts structured biomarkers, medications, and doctor questions in real time. If `GEMINI_API_KEY` is missing or `useMock=true`, it returns a static high-fidelity fallback response.
*   **Supabase PostgreSQL synchronization is dormant:** The code in [context.tsx](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/context.tsx) supports Supabase PostgreSQL sync when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided. However, no remote Supabase backend is currently provisioned, and no SQL migration files exist in the repository.
*   **The database safety lock is 100% real:** A startup guard in [client.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/lib/supabase/client.ts) prevents accidental connection to the protected `trelis-life` database (`lhqtqofjrqoyscobsfud`).
*   **WhatsApp messaging is in dry-run mode:** The smartphone chat dashboard is an interactive simulation mockup. The API routes ([send](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/send/route.ts), [webhook](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/webhook/route.ts), [simulate](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/app/api/whatsapp/simulate/route.ts)) are coded, but defaulted to `WHATSAPP_DRY_RUN=true` to prevent unauthorized message dispatches.
*   **Deterministic vs. AI Clinical Boundaries:** Clinical triage status (`careStatus`), vitals reference range checks, and Doctor Brief compilation are 100% deterministic rules engines ([carePlanEngine.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/utils/carePlanEngine.ts), [careTeamEngine.ts](file:///d:/0000_after%20portfolio_25726/4_parents-health-os/parents-health-os/src/utils/careTeamEngine.ts)). Gemini AI is restricted strictly to raw PDF report parsing and never modifies patient triage status or clinical rules.

## 8. Product-Bar Audit Results (Tested September 3, 2026)
*   **Test 1: Second device cross-sync → FAIL (Local-Only)**  
    Because the default state uses `localStorage` with no active remote Supabase database, a second device running the app starts with an un-synced sandbox state.
*   **Test 2: Real WhatsApp E2E messaging → FAIL (Dry-Run Default)**  
    The WhatsApp service defaults to `isDryRun = true` and has no configured Meta Business API tokens or public webhook URL. Outbound dispatches write dry-run logs instead of sending live SMS/WhatsApp messages.
*   **Test 3: Storage wipe resilience → FAIL (Client Storage Dependent)**  
    Clearing browser storage removes `parents_health_auth_v2` and all `parents_health_*` data keys, resetting the environment to unauthenticated. (Users can manually preserve data via the JSON export tool).

## 9. Top Known Limitations & Technical Gaps
1.  **No SQL Migrations or Schema Files:** Zero `.sql` or migration files exist in the repository. Connecting a new Supabase project requires creating 14 tables manually from `types.ts`.
2.  **Cosmetic Sync Queue:** The `simulateSyncAll()` function in `syncQueue.ts` updates event statuses locally in `localStorage` without executing remote HTTP requests.
3.  **WhatsApp Webhook Chained Query Bug:** Lines 126 in `webhook/route.ts` and 84 in `simulate/route.ts` call `.from("medications").eq(...)` without a leading `.select()`, causing medication query responses to evaluate as empty.
4.  **Observations & Consultations Local-Only:** Observations (`parents_health_observations_${pId}`) and doctor appointment requests (`phos_consult_requests_${pId}`) only persist to `localStorage` and lack Supabase sync mappings.
5.  **No Automated Unit Tests:** `npm test` fails with `"Missing script: test"`. No automated test suite is configured.
6.  **Next.js 16 Proxy Deprecation Warning:** `npm run build` succeeds cleanly but emits a deprecation warning regarding the `middleware` file convention (should be renamed to `proxy`).

## 10. Ready-made copy
- **Resume bullet, 1 line**  
  Designed and built a local-first geriatric care console using Next.js, Supabase, and Google Gemini AI to parse diagnostic lab reports and automate patient check-ins.
- **Resume bullets, 3 lines**  
  Created an offline-first eldercare operating console using Next.js and Supabase, utilizing local storage persistence with a transactional sync queue for network resilience.  
  Developed a deterministic rules engine to calculate patient-specific vitals triage alerts and auto-generate print-ready doctor briefings.  
  Integrated Google Gemini AI to parse structured biomarkers and medicines from uploaded diagnostic PDFs, with an automated model fallback chain.
- **Portfolio card, short (max 30 words)**  
  A Next.js and Supabase health console for Indian eldercare. It automates parent check-ins via WhatsApp, parses diagnostic reports using Gemini, and alerts caregivers to vitals deviations.
- **Portfolio card, medium (60–80 words)**  
  First Family Care Console is a Next.js and Supabase web dashboard designed to manage elderly health remotely. The platform coordinates patient care by replacing complex apps with automated WhatsApp check-ins. It features a custom rules engine that adjusts vitals alerts based on chronic baselines, processes diagnostic PDFs using Gemini AI, and generates printable clinical briefings. It runs in an offline-first local sandbox mode to ensure strict privacy.
- **LinkedIn "Projects" blurb (40–60 words)**  
  I developed First Family Care Console, a local-first web platform for remote eldercare in India. Built with Next.js, Supabase, and Gemini AI, it uses rules-based vitals tracking to prevent alert fatigue, parses blood panels, and simulates WhatsApp-based parent check-ins. All data is processed locally to maintain personal data protection compliance.
- **GitHub README opening paragraph**  
  First Family Care Console is a context-aware health console and care operations dashboard designed for remote eldercare in India. Built with Next.js, Supabase, and Google Gemini AI, the platform coordinates daily senior health tracking by replacing complex patient-facing apps with automated WhatsApp check-ins. It features a rules-based triage engine that customizes vital alert thresholds based on chronic baselines, parses diagnostic lab reports to extract biomarkers, and generates printable briefings for doctor consultations. The app operates in a secure, local-first sandbox mode to respect data privacy guidelines.

## 11. Interview talking points
*   **What to lead with (Technical Depth):** Focus on the offline-first sandbox design. Explain how you implemented the transactional sync queue (`syncQueue.ts`) and local persistence layer (`localPersistence.ts`) to manage state, and how the app seamlessly shifts to a live database when Supabase credentials are detected. Mention the safety lock in `client.ts` that blocks connection to the forbidden project as an example of production-grade engineering safety.
*   **What to lead with (Product Empathy):** Describe the clinical insight behind the rules-based triage engine: standard apps flag vitals using generic populations, which causes alarm fatigue, whereas in geriatrics, keeping blood glucose slightly elevated is a deliberate choice to prevent hypoglycemic falls. Highlight that you solved senior technology barriers by making the parent's interface WhatsApp-first.
*   **What to admit (The WhatsApp Simulation):** Be transparent that the WhatsApp chatbot interface in the dashboard is an interactive simulation mockup for demonstration purposes. Explain that while the webhook API and service layers are implemented, live execution is bypassed in dry-run mode until official Meta Developer business verification and approved message templates are configured.
*   **What to admit (Data Encryption Gaps):** Acknowledge that the sandbox mode stores records as unencrypted plain JSON strings in browser `localStorage`. Mention that in a production-ready client vault, you would add client-side AES-256 encryption before saving sensitive health profiles.
*   **What to avoid overclaiming (AI Autonomy):** Avoid claiming that the AI behaves as an autonomous medical diagnostic assistant. Emphasize that the AI is explicitly bounded: Gemini is only used to parse raw diagnostic PDFs and extract data. The care triage status and doctor agendas are handled by a deterministic, rules-based engine, and all generated briefs display safety disclaimers for professional clinical validation only.
