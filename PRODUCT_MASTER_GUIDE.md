# Parents Health OS: The Definitive Product Architecture, Strategy, & Replication Manual
**Version:** 6.3 (The Unified Production-Grade Reference Authority)  
**Status:** Approved for Sandbox Release / Phase-Ready for Live Migration  
**Principal Architect:** Tharun Gajula  
**Last Updated:** May 28, 2026

---

## 📌 Current Continuity Snapshot — Read This First

### 1. Current State in One Paragraph
**Parents Health OS** is currently a fully stable, high-fidelity interactive sandbox prototype running in **Next.js 16 / TypeScript / Tailwind CSS v4 / PostCSS**. All clinical scores, daily habit checklist compliance indices, and user-profile isolated states are managed **100% client-side** using browser-based local storage (`localStorage`). Optional multimodal medical report analysis is powered by the **Google Gemini 2.5 Flash API** (with automatic rate-limit failover to `gemini-2.5-flash-lite`) via a dynamic serverless API endpoint, requiring explicit client-side user opt-in and consent. The public-facing Resource Library (`/resources`) features a premium client-side canvas-rendered PDF viewer (`DeckViewer.tsx`) that enforces a strict no-download presentation policy. A production-grade Service Worker caching shell (`sw.js`) guarantees offline resilience by caching static assets and pre-rendering curriculum content. To support downstream cloud migration without actual transmission, an isolated local sync events engine (`syncQueue.ts`) records structured event metadata for checklist updates, vitals logging, scorecard saves, and profile edits, monitored via a dynamic Settings panel.

### 2. Completed Phases Summary
-   **Branding & Core Baseline Setup:** Established a high-contrast, premium, warm teal and cream healthcare aesthetic ("Sanskaar-UX") optimized for senior legibility and family trust.
-   **Phase 1A (Workspace Isolation & Backups):** Implemented multi-profile switcher ("Amma Demo" vs "Papa Demo") with scoped storage sandboxes and local JSON schema portable backup/import utilities.
-   **Phase 1A.1 (Privacyコピー & AI Consent Hardening):** Added granular, mandatory checkbox consent grids before routing clinical reports to external Google Gemini API nodes.
-   **Phase 1B (Today's Care Dashboard & Observations):** Rolled out Today's checklist slots, symptom tracking feeds, deterministic local Anaya summaries, and monospace printing consultation briefs.
-   **Phase 1C (Stabilization & Caregiver Checklist):** Shifted warning copy from clinical diagnostic thresholds to **Reference Range Notifications**, avoiding emergency-care claims, and mounted first-time onboarding checklists.
-   **Phase 1D (Stable Sandbox Release Snapshot):** Corrected card readability contrast by introducing the custom `.text-white-only` token and verified production compilation.
-   **Phase 2A (Public Resources Library & Slider Viewer):** Deployed index library and dynamic routes rendering static curriculum decks.
-   **Phase 2B.1 (Local Offline Resilience & Sync Telemetry):** Implemented client-side write trackers, metadata managers, and interactive Sync simulation widgets in the Caregiver Dashboard and Sandbox Settings.
-   **Phase 2B.2 (Offline Service Worker Layer):** Created standard-compliant browser service worker (`sw.js`) and dynamic register controls (`ServiceWorkerRegister.tsx`) caching the premium static app shell and curriculum assets with strict caching bypass lists (avoiding dynamic health records, Gemini endpoints, and WhatsApp simulations).
-   **Phase 2B.3 (Future Cloud Sync Queue):** Engineered a high-fidelity local mutation pipeline (`syncQueue.ts`) that records metadata-safe offline events across all dashboard mutations. Deployed premium sync management tools and a dynamic event logger details widget inside the Settings & Backup UI.

### 3. Current Branch, Commit, and Directory Status
-   **Current Branch:** `main` (Working tree clean; zero uncommitted build errors).
-   **Last Commit:** `Phase 2B.2 and 2B.3 completed - Offline Service Worker + Future Cloud Sync Queue`
-   **Phase 2B Completed Files:** `public/sw.js` (core caching worker), `src/components/ServiceWorkerRegister.tsx` (caching loader and unregister utilities), `src/lib/offline/syncQueue.ts` (offline mutation pipeline), `src/lib/supabase/context.tsx` (sync events dispatcher integration), `src/components/SettingsAndBackup.tsx` (simulated sync controller and dynamic event visualizer board).
-   **Demo Freeze QA Status:** **PASSED & LOCKED**. Sandbox contains 100% airtight clinical safeguards, strict user AI consent checkbox gates, localized data privacy boundaries, simulated queue visualizers, and fully verified static asset service workers.
-   **Safest Next Action:** Initiate the step-by-step dedicated cloud database preflight using `LIVE_BACKEND_PREFLIGHT.md`.

### 4. Critical Boundaries (Things NOT to do)
-   ❌ **NEVER target the protected live production database `trelis-life` (ref: `lhqtqofjrqoyscobsfud`)** with any SQL migrations, schema checks, or auth calls.
-   ❌ **NEVER paste Supabase URL/keys into `.env.local`** unless a new, dedicated `parents-health-os` database instance has been manually established on your own Supabase account.
-   ❌ **NEVER bypass the Gemini Consent Gate** in `SmartReport.tsx` or route report data without verifying the active `consentChecked` state.
-   ❌ **NEVER re-add the strategic Vision deck PDF** under the public `/public/resources/` paths without protecting it behind a secure authentication gate.

### 5. Critical Open Decisions
-   *Vision Deck Access:* The Parents Health OS strategic vision/pricing deck has been completely removed from the public resource array to protect core business intelligence. A secure, invite-only, password-protected routing filter must be designed before re-publishing.

---

## A. Current Product Identity

*   **Official Product Name:** Parents Health OS
*   **AI Care Assistant Persona Name:** Anaya (Conversational Care Companion & Clinical Analyst)
*   **Founder & Principal Architect:** Tharun Gajula
*   **Current Positioning:** A warm, premium, family-shared elder-care coordination platform. It acts as a specialized coordination layer—providing respectful, zero-friction WhatsApp companion checks for aging parents in India, and high-fidelity, context-aware dashboards for adult children and caregivers managing family health budgets.
*   **Current Deployment Status:** Production-deployed and running on Vercel ([https://parents-health-os.vercel.app/](https://parents-health-os.vercel.app/)).
*   **Current App Mode:** Standalone Sandbox / Local-First Browser Mode (`isSupabaseEnabled = false` because no live database credentials exist in the environment).
*   **Public vs. Private Exposure:**
    *   **Public (Open Access):** Landing splash screen, Public Resource Library `/resources`, and the public curriculum `/resources/body-mind-os`.
    *   **Private Sandbox (Local Auth Gate):** The main caregiver dashboard (`/`), profile onboarding switcher, clinical scorecards, checklist tracker, simulated IoT panel, simulated WhatsApp live preview, smart report upload engine, and printable doctor briefs. Access is gated by a local authentication simulator.
    *   **Vision Deck Status:** **Fully Purged** from origin repositories to eliminate unauthorized viewing of corporate pricing and long-term milestones.

---

## B. Current Build Phases Completed

### 1. Branding Cleanup / Deployment Baseline
-   **What Was Built:** Shifted from cold dark-HUD grids to a calming, warm, high-contrast healthcare design. Reconfigured default Tailwind colors using custom teal (`#0E5E5A`) and saffron amber (`#E05E1B`) tokens mapping off-white cream backgrounds (`#FAF9F6`) and charcoal text (`#122321`).
-   **Main Files Changed:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
-   **User-Facing Behavior:** Warm, premium landing layouts with rounded card profiles, smooth hover transformations, and beautiful visual typography.
-   **Storage Behavior:** Stateless initialization.
-   **Safety Impact:** Clean, non-alarming branding avoids anxiety in clinical coordination.
-   **Known Limitations:** Some hardcoded contrast settings inside legacy container tags were manually resolved using the custom `.text-white-only` utility classes.

### 2. Phase 1A: Personal Sandbox / Profile / Backup Foundation
-   **What Was Built:** Multi-profile isolation switcher enabling toggles between "Amma Demo" and "Papa Demo" workspace records. Created a modular settings sidebar housing storage calculators, data erasure triggers, and import/export utilities. Developed local JSON backup engines to pack entire profiles, vitals logs, checklists, and observations into portable JSON downloads.
-   **Main Files Changed:** `src/app/page.tsx`, `src/components/SettingsAndBackup.tsx`
-   **User-Facing Behavior:** Swapping parent profiles instantly re-renders the dashboard telemetry. Settings sidebar provides active buttons to download file backups (`parents-health-backup.json`) and drag-and-drop restore files.
-   **Storage Behavior:** Scopes all data items under namespaces scoped by active parent IDs (`sandbox-parent-id` and `sandbox-parent-2-id`) inside browser `localStorage`.
-   **Safety Impact:** Assures zero data leakage between distinct parent records.
-   **Known Limitations:** Browser-specific; clearing browser history/data wipes local sandbox profiles unless backups are explicitly preserved.

### 3. Phase 1A.1: Truthful Privacy Copy & AI Consent Hardening
-   **What Was Built:** Placed explicit, high-contrast disclaimer banners detailing data routing. Added compulsory opt-in checkbox gates that restrict report processing until the caregiver confirms parental authorization.
-   **Main Files Changed:** `src/components/SmartReport.tsx`, `src/components/SettingsAndBackup.tsx`, `src/app/page.tsx`
-   **User-Facing Behavior:** Caregivers must manually click a consent checkmark before the "Simulate Analysis" or "Upload Lab Report" dropzones become active.
-   **Storage Behavior:** Tracks consent selection states locally under active profile parameters.
-   **Safety/Privacy Impact:** Adheres strictly to the consumer trust mandates of India's **DPDPA 2023** by separating core tracking features from optional AI report analysis.
-   **Known Limitations:** Since sandbox is offline, consent is recorded locally rather than synced to a centralized immutability log.

### 4. Phase 1B: Daily Care Dashboard, Real Personal Logs, & Local Anaya Summary
-   **What Was Built:** Consolidated daily status progress indicators. Structured tracking lists divided into Morning, Noon, Evening, and Night routines. Integrated vital entry fields (systolic, diastolic, glucose, weight, notes) and observations classified by severity across 9 clinical pillars. Built a deterministic, offline summary compiler ("Local Anaya Summary") and monospace-formatted print consult sheets.
-   **Main Files Changed:** `src/app/page.tsx`, `src/lib/supabase/context.tsx`, `src/utils/carePlanEngine.ts`
-   **User-Facing Behavior:** Interactive checklist checkoffs immediately update adherence status rings. Clicking "Generate Doctor Brief" renders a monospace print layout of clinical timelines.
-   **Storage Behavior:** Logs daily parameters under explicit date-stamped keys (`parents_health_daily_log_YYYY-MM-DD_parent-id`).
-   **Safety Impact:** Avoids external API calls for daily summaries, ensuring sensitive observations remain local.
-   **Known Limitations:** Deterministic rules are basic; complex, longitudinal symptom correlations require deeper clinical algorithms.

### 5. Phase 1C: Personal-Use Stabilization
-   **What Was Built:** Replaced diagnostic warning blocks with safe, non-clinical reference notifications. Added user-controlled print layouts executing browser print calls strictly upon active user action. Mounted onboarding checklists and persistent reminder banners highlighting local browser storage residency.
-   **Main Files Changed:** `src/app/page.tsx`
-   **User-Facing Behavior:** Vitals alerts explain values are outside standard ranges and prompt professional reviews. Caregivers check off onboarding checklists to guide their setup.
-   **Storage Behavior:** Saves setup checkboxes in local scope.
-   **Safety Impact:** Eliminates claims of diagnostic/emergency support, reinforcing platform positioning as a caregiver-assistive utility.
-   **Known Limitations:** Setup checklist is manual and requires user check-offs.

### 6. Phase 1D: Stable Sandbox Release Snapshot
-   **What Was Built:** Resolved text contrast overlapping bugs within dark container elements. Verified strict Next.js compilation constraints and pushed the stable version baseline to Origin Main.
-   **Main Files Changed:** `src/app/page.tsx`
-   **User-Facing Behavior:** High-legibility text blocks across all dashboard segments.
-   **Storage Behavior:** Unchanged.
-   **Safety Impact:** Confirmed build stability (Exit Code 0).
-   **Known Limitations:** Sandbox remains local-only.

### 7. Phase 2A: Public Resources Library + PDF Slide Viewer
-   **What Was Built:** Designed a clean, glassmorphic Resource index (`/resources`) and dynamic pre-rendered page routes (`/resources/[deck]`). Built a custom React presentation viewer (`DeckViewer.tsx`) that uses client-side canvas engines to render local PDF documents without providing visible download, export, or PPTX source code selectors.
-   **Main Files Changed:** `src/lib/resources/decks.ts`, `src/components/resources/DeckViewer.tsx`, `src/components/resources/ResourceDeckCard.tsx`, `src/app/resources/page.tsx`, `src/app/resources/[deck]/page.tsx`
-   **User-Facing Behavior:** Public visitors can browse resources and view slides in fullscreen focus modes with swipe/progress navigators.
-   **Storage Behavior:** Serves PDFs directly from static `/public/resources/` asset buffers.
-   **Safety/Privacy Impact:** A strict "No-Download" presentation-only interface prevents casual replication of original curriculum materials.
-   **Known Limitations:** Advanced users can theoretically trace raw URL links under browser network panels since static files under `/public` are accessible by default browser protocols.

### 8. Phase 2B.1: Offline Resilience & Sandbox Sync Trackers
-   **What Was Built:** Engineered a core offline persistence mechanism (`localPersistence.ts`) to track local mutations inside the client-side sandbox. Mounted real-time state listeners in `context.tsx` that calculate last-saved timestamps and track unsaved edits across all database mutators (vitals, meds, logs, smart reports, checklists). Deployed highly interactive, premium glassmorphic Sync Telemetry Bars in the main caregiver dashboard and settings panels, enabling caregivers to inspect local data vaults, view integrity status, and trigger simulated commits.
-   **Main Files Changed:** `src/lib/offline/localPersistence.ts` (new core utility), `src/lib/supabase/context.tsx` (state integrations and triggers), `src/app/page.tsx` (dashboard HUD status bar), `src/components/SettingsAndBackup.tsx` (vault manager panels).
-   **User-Facing Behavior:** Caregivers see a real-time "Sandbox Data Vault" status bar in their workspace. Recording clinical logs or checklist parameters immediately increments the "Pending changes" indicator. Clicking "Simulate Sync" clears the local buffer with a confirmation toast.
-   **Storage Behavior:** Persists database updates directly in namespace structures under `parents_health_offline_metadata` in browser local cache.
-   **Safety/Privacy Impact:** Hardens local-first offline safety by tracking exact client data residency without violating the strict `trelis-life` Supabase production database security boundaries.
-   **Known Limitations:** Offline mode runs fully inside client scope.

### 9. Phase 2B.2: Offline Service Worker Layer
-   **What Was Built:** Developed a native, standard-compliant Service Worker (`public/sw.js`) and a Client registration controller (`ServiceWorkerRegister.tsx`) to implement reliable, local offline access to static visual files. Caches the premium off-white layout shell, core presentation engine scripts, and public educational curriculum (`body-mind-os.pdf`) while strictly bypassing and ignoring all dynamic queries, secure upload APIs (`/api/analyze`), mock WhatsApp simulation endpoints, and private browser-cached profile databases. Added automated development-mode bypass switches that unregister active workers instantly to prevent stale caching issues during programming iterations.
-   **Main Files Changed:** `public/sw.js` (caching core worker), `src/components/ServiceWorkerRegister.tsx` (dynamic loader), `src/app/layout.tsx` (layout entry mount), `src/components/SettingsAndBackup.tsx` (dynamic status indicator panel).
-   **User-Facing Behavior:** Settings panel includes a green "Active" indicator in production, showing that the offline app shell is cached. In local dev mode, the status is safely flagged as "Bypassed (Dev)" to aid ongoing developer tasks.
-   **Storage Behavior:** Manages visual static cache inside standard browser CacheStorage under named keys (`parents-health-os-shell-v1`).
-   **Safety/Privacy Impact:** Enforces absolute data boundaries by completely excluding dynamic health observations, diagnostic PDFs, and Gemini context requests from Service Worker caching layers.
-   **Known Limitations:** First-load requires dynamic server connections.

---

## C. Current Route Map

### 1. `/` (Dashboard Workspace)
*   **Purpose:** The central operational dashboard for family care coordination.
*   **Public/Private Status:** Private (Simulated Authentication Gate).
*   **Key Files/Components:** `src/app/page.tsx`, `src/lib/supabase/context.tsx`, `src/components/ClinicalEngine.tsx`, `src/components/MedicationTracker.tsx`, `src/components/SmartReport.tsx`, `src/components/CareTeam.tsx`, `src/components/WhatsAppDemo.tsx`, `src/components/ClinicHub.tsx`, `src/components/SettingsAndBackup.tsx`.
*   **Data Flow:** Pulls from `useParentsAuth()` context. In sandbox mode, it initializes demo profiles from local storage, mounts checklist states, and logs new telemetry parameters client-side.
*   **External API Usage:** Calls `/api/analyze` during optional PDF document uploads or holistic multi-report summary synthesis.

### 2. `/resources` (Public Resource Library)
*   **Purpose:** Lists education decks and strategic health manuals.
*   **Public/Private Status:** Public (Open Access).
*   **Key Files/Components:** `src/app/resources/page.tsx`, `src/components/resources/ResourceDeckCard.tsx`, `src/lib/resources/decks.ts`.
*   **Data Flow:** Reads metadata objects directly from the `DECKS` array.
*   **External API Usage:** None.

### 3. `/resources/[deck]` (Presentation Slider Viewer)
*   **Purpose:** Custom fullscreen slide reader rendering raw PDF page files.
*   **Public/Private Status:** Public (Dynamic routing slots pre-compiled at build time via `generateStaticParams()`).
*   **Key Files/Components:** `src/app/resources/[deck]/page.tsx`, `src/components/resources/DeckViewer.tsx`, `src/lib/resources/decks.ts`.
*   **Data Flow:** Maps parameter slug tags against `getDeckBySlug()`, fetching details and loading local PDF pathways.
*   **External API Usage:** Uses client-side PDF.js script instances loaded via CDN buffers to render PDF pages onto HTML5 canvas nodes.

### 4. `/api/analyze` (Longitudinal Analysis Endpoint)
*   **Purpose:** Processes multimodal documents (lab reports, prescriptions) and compiles holistic multi-report summaries.
*   **Public/Private Status:** Public/Serverless API Endpoint.
*   **Key Files:** `src/app/api/analyze/route.ts`.
*   **Data Flow:** Accepts `multipart/form-data` containing file streams, `clinicalContext` variables, and active history parameters. Generates structured JSON responses mapping abnormal biomarkers and parsed medication rosters.
*   **External API Usage:** Executes text/image analysis via `@google/generative-ai` routing to `gemini-2.5-flash` with failover catches connecting to `gemini-2.5-flash-lite`.

### 5. `/api/whatsapp/*` (Simulated Gateway)
*   **Purpose:** Mocks the behaviors of live WhatsApp communication templates.
*   **Routes Present:**
    *   `/api/whatsapp/send`: Mocks outward templates.
    *   `/api/whatsapp/simulate`: Simulates incoming elder replies.
    *   `/api/whatsapp/webhook`: Handles inbound notification shapes.
*   **Public/Private Status:** Simulation API endpoints.
*   **Key Files:** `src/app/api/whatsapp/send/route.ts`, `src/app/api/whatsapp/simulate/route.ts`, `src/app/api/whatsapp/webhook/route.ts`.
*   **Data Flow:** Receives target parameters and updates local dashboard chat message history.
*   **External API Usage:** None (mocked/dry-run states).

---

## D. Current Component Map

| Component Name | File Path | Function/Purpose | Data Read/Write Behavior | Development Readiness Status |
| :--- | :--- | :--- | :--- | :--- |
| **ClinicalEngine** | `src/components/ClinicalEngine.tsx` | Geriatric assessment questionnaire covering 10 health dimensions. | Reads assessment answers; writes scores and risk levels. | Production-Ready Foundation |
| **MedicationTracker** | `src/components/MedicationTracker.tsx` | Scopes daily medication slots and logs compliance. | Reads active med lists; writes logs and updates dashboard progress. | Production-Ready Foundation |
| **SmartReport** | `src/components/SmartReport.tsx` | Diagnostic document drag-and-drop OCR ingestion block. | Reads profile variables; writes parsed biomarkers to storage. | Production-Ready Foundation |
| **CareTeam** | `src/components/CareTeam.tsx` | Maps clinical team nodes and appointments. | Reads appointment arrays; writes schedules and prints briefs. | Production-Ready Foundation |
| **WhatsAppDemo** | `src/components/WhatsAppDemo.tsx` | Simulated smartphone chat window displaying companion dialogues. | Reads chat collections; writes mock messages. | Interactive Sandbox Simulator |
| **ClinicHub** | `src/components/ClinicHub.tsx` | Financial credits co-pay manager (Praan Wallet) & insurance. | Reads and decrements mock wallet balances. | Interactive Sandbox Simulator |
| **HealthTrendChart** | `src/components/HealthTrendChart.tsx` | Interactive line chart mapping blood pressure and sugar. | Reads chronologically parsed vital streams. | Production-Ready Foundation |
| **CallOverlay** | `src/components/CallOverlay.tsx` | Audio alerting modal simulating urgency rings. | Triggers local Web Audio oscillators and Speech TTS. | Interactive Sandbox Simulator |
| **ActivityFeed** | `src/components/ActivityFeed.tsx` | Real-time chronological audit list of dashboard logs. | Reads active audit datasets. | Production-Ready Foundation |
| **SettingsAndBackup** | `src/components/SettingsAndBackup.tsx` | Storage deletion, profile resets, and JSON backup utilities. | Reads total memory size; writes uploaded JSON payloads. | Production-Ready Foundation |
| **ResourceDeckCard** | `src/components/resources/ResourceDeckCard.tsx` | Glassmorphic card displaying slide meta. | Reads deck category, description, and page counts. | Production-Ready Foundation |
| **DeckViewer** | `src/components/resources/DeckViewer.tsx` | Premium presentation viewer rendering PDFs on Canvas. | Reads localized PDF documents. | Production-Ready Foundation |
| **HeaderIcons** | `src/components/HeaderIcons.tsx` | Action controls for notifications, profile dropdowns. | Reads parent notifications and switchers. | Production-Ready Foundation |

---

## E. Current Library & Data Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts          # Gemini Ingestion and Synthesis API
│   │   └── whatsapp/                 # Simulated Webhook Gateway Routes
│   ├── resources/                    # Learning Hub Index & Deck Slugs
│   ├── globals.css                   # Theme configurations & Glassmorphic variables
│   └── page.tsx                      # Dashboard view manager & Onboarding Wizard
├── components/                       # Premium Glassmorphic React Modules
├── lib/
│   ├── resources/decks.ts            # Slide Metadata & Educational Disclaimers
│   ├── supabase/                     # Client Initializer & Context context.tsx
│   └── whatsapp/                     # Message Template Configurations
└── utils/                            # Support engines (Care Plans, Demos, Teams)
```

### 1. The Context Engine (`src/lib/supabase/context.tsx`)
This is the master architecture of data persistence. It checks for Supabase variables in environment variables:
-   **If found:** Sets `isSupabaseEnabled = true` and streams live collections.
-   **If absent (Default):** Sets `isSupabaseEnabled = false` and routes all actions into scoped local namespaces.

#### Scoped localStorage Registry Keys:
*   `parents_health_auth_v2`: Boolean gating access.
*   `parents_health_user_name`: Primary string.
*   `parents_health_active_parent_id`: Tracks selected parent.
*   `parents_health_assessment_data_v2_[PARENT_ID]`: Geriatric answers.
*   `parents_health_active_meds_[PARENT_ID]`: Medication registries.
*   `parents_health_history_[PARENT_ID]`: History array.
*   `parents_health_observations_[PARENT_ID]`: Symptom entries.
*   `parents_health_whatsapp_messages_[PARENT_ID]`: Message histories.
*   `parents_health_ai_conversations_[PARENT_ID]`: AI parsed logs.

#### High-Fidelity JSON Schema Configurations:

```json
// parents_health_assessment_data_v2_[PARENT_ID]
{
  "answers": {
    "q1": "70+",
    "q2": "Diabetes",
    "q3": "Multiple/Severe",
    "q4": "Sometimes",
    "q5": "No",
    "q6": "Sometimes",
    "q7": "Once/Minor",
    "q8": "Sometimes/Mild",
    "q9": "Once",
    "q10": "Occasionally",
    "q11": "Occasionally",
    "q12": "Sometimes",
    "q13": "Sometimes",
    "q14": "Sometimes",
    "q15": "None"
  },
  "scores": {
    "total": 60,
    "riskLevel": "High Risk: Immediate Action Required"
  }
}
```

```json
// parents_health_active_meds_[PARENT_ID]
[
  {
    "id": "sandbox-med-1",
    "parent_id": "sandbox-parent-id",
    "name": "Glycomet 500mg",
    "dosage": "500mg",
    "timing": "Morning",
    "instructions": "Take before breakfast",
    "is_active": true,
    "created_at": "2026-05-28T10:00:00.000Z"
  }
]
```

```json
// parents_health_daily_log_YYYY-MM-DD_[PARENT_ID]
{
  "meds": ["sandbox-med-1"],
  "vitals": {
    "bpSys": 125,
    "bpDia": 82,
    "sugar": 115,
    "weight": 64.8
  },
  "habits": {
    "mealPlan": true,
    "activity": 45,
    "hydration": 8
  }
}
```

---

## F. External Services and APIs

### 1. Google Gemini 2.5 Flash API
-   **Role:** Multimodal analysis brain.
-   **Endpoint:** `/api/analyze`.
-   **Opt-In Policy:** Bypassed in normal operations. Uploads or holistic summaries prompt caregivers with safety checks before executing.
-   **Failover Logic:** Unhandled requests or rate limits fallback to `gemini-2.5-flash-lite`.

### 2. Local/Deterministic Synthesis
-   **Role:** Offline summary creation.
-   **Implementation:** Geriatric profiles and active logs run against local rules (`carePlanEngine.ts`) to write briefs without calling external servers.

### 3. WhatsApp Meta Cloud API Onboarding Specs
-   **Onboarding Steps:**
    1.  *Corporate Verification:* Match company details on Meta Business Manager.
    2.  *Billing setup:* INR chosen at WABA registry.
    3.  *Access Token:* Set secure keys.
    4.  *Inbound Webhook:* Point Meta's webhook to `https://your-domain.com/api/wa/webhook`.
-   **Pricing Framework (India rates, 2026):**
    *   *Service (user-initiated):* Free within a 24-hour response window.
    *   *Utility (checklist reminders):* ~₹0.115–₹0.13 per message.
    *   *Marketing:* ~₹0.86–₹0.88 per message.

---

## G. Resources & Curriculum System

### 1. Public Learning Curriculum
-   **Primary Asset:** "Body & Mind OS" covers prevention, nutrition, sleep, and family coordination.
-   **Location:** `public/resources/decks/body-mind-os/body-mind-os.pdf`.
-   **Rendering Logic:** Static routes pre-compiled at build. No download scripts are embedded in the UI.

### 2. Strategic Vision Deck Removal
-   **Strategic Decision:** The Parents Health OS strategic vision/pricing deck has been **completely removed** to prevent unauthorized access.
-   **System Guarantee:** Grep scans confirm that no references to `parents-health-os-vision` exist under `/resources` or compiler scripts.

---

## H. Security, Privacy, and Safety Rules

### 1. Live Production Database Safe boundary
-   **FORBIDDEN PROJECT:** `trelis-life`
-   **FORBIDDEN PROJECT REF:** `lhqtqofjrqoyscobsfud`
-   **Policy:** No Parents Health OS tasks may communicate, execute SQL, or branch from this ref.

### 2. Medical & Clinical Disclaimer Guidelines
-   **Mandatory Language:** Platforms serve as coordination utilities. All interfaces contain explicit disclaimers:
    > *"Parents Health OS is a caregiver-assistive coordination, summarization, and reminder utility. It is not licensed medical software, does not provide diagnostics or prescriptions, and does not replace professional clinical decisions."*

### 3. DPDP Act 2023 Readiness Language
-   **Policy:** Platform compliance is described as **"readiness, aligned, and design checklist"** rather than "fully compliant" to reflect active audit and review states.

---

## I. Current Known Limitations

1.  **Browser Specificity:** Sandbox profiles and logs reside in `localStorage`, meaning clearing browser storage clears profiles unless JSON backups are saved.
2.  **Mocked Wearable IoT:** CGM and smartwatch links simulate data inputs rather than calling actual Bluetooth pairing profiles.
3.  **Simulated WhatsApp Gateway:** The WhatsApp window mimics chat feeds but does not dispatch actual messages to mobile numbers.
4.  **No Cloud Sync:** Caregivers cannot sync records between separate mobile devices or family roles without local JSON file transfers.

---

## J. Strategic Roadmap & Next Steps

```mermaid
gantt
    title Parents Health OS Engineering Pipeline
    dateFormat  YYYY-MM-DD
    section Completed Stages
    Phase 2B: Advanced Care Simulation & Sync  :active, des1, 2026-05-28, 1d
    section Next Sprint
    Phase 3A: Live Supabase India Migration    :des2, after des1, 25d
    section Future Stages
    Phase 3B: Auth & Family Workspace Scaling  :des3, after des2, 20d
    Phase 4: Live WhatsApp Meta Cloud API      :des4, after des3, 30d
```

### 1. Phase 2B: Advanced Care Simulation & Offline Sync Engines (Completed)
-   **Objective:** Develop local service worker caching, real-time state telemetry buffers, and local sync event queues.
-   **Files Completed:** `src/lib/offline/localPersistence.ts`, `public/sw.js`, `src/components/ServiceWorkerRegister.tsx`, `src/lib/offline/syncQueue.ts`.

### 2. Phase 3A: Dedicated Supabase Backend Migration
-   **Objective:** Move from local storage to live regional databases.
-   **Files Affected:** `.env.local`, `src/lib/supabase/*`, `src/components/SettingsAndBackup.tsx`.
-   **Prerequisite:** Developer must manually create a dedicated Supabase project, avoiding `trelis-life` boundaries.

### 3. Phase 3B: Auth & Family Workspace Scaling
-   **Objective:** Implement multi-user workspace access for family circles.
-   **Files Affected:** `src/lib/supabase/context.tsx`, `src/components/HeaderIcons.tsx`.

---

## K. Comprehensive Investor Demo Script & Q&A Blueprint

### 1. Interactive Demo Speaking Notes

#### Welcome & Identity Setup:
> *"Every working professional experiences constant anxiety when managing their aging parents' chronic health conditions from a distance. Standard clinical tools are too cold, causing seniors to resist installing them. We solved this with Parents Health OS: a calming, warm coordination dashboard that brings care directly to where seniors are—on WhatsApp. As I switch profiles from Amma to Papa, the entire dashboard matches their distinct records instantly."*

#### Geriatric Scoring Checklist:
> *"Most apps just track raw vitals. Parents Health OS calculates a comprehensive 15-question Geriatric Scorecard covering metabolic, cognitive, emotional, sleep, muscular, and frailty factors. The resultant score classifies the parent into risk profiles—Healthy, Moderate, or High. High-risk profiles automatically trigger more intensive care companion loops."*

#### Simulated IoT Sync:
> *"Type fatigue is a massive hurdle for elderly adoption. By clicking 'SYNC CGM', metabolic logs populate from FreeStyle Libre simulators immediately. Smartwatch tracking logs weight and exercises in real-time, delivering immediate visual compliance indicators."*

#### Document Parsing & Doctor Brief:
> *"Diagnostic labs deliver dense PDFs that cause immense caregiver stress. Parents Health OS extracts biomarkers using Google Gemini 2.5 Flash, explaining medical terms in simple language inside brackets. More importantly, we synthesize these reports with daily log compliance to generate a concise, print-ready 'Doctor Brief'. When the parent visits their physical doctor, they present a single-page timeline that optimizes consult efficiency."*

---

## L. Product Master Guide Revision Registry

-   **Version 6.3 (May 28, 2026):** Engineered Phase 2B.3 Future Cloud Sync Queue. Deployed an offline-safe local mutation queue engine (`syncQueue.ts`) that listens to and logs checklist completions, vital records, caregiver profile switches, scorecard saves, and profile updates. Created simulated cloud sync actions and a custom visualizer details panel inside the Settings & Backup UI to display the latest logged event and payload schema. Verified full Next.js 16 build validation.
-   **Version 6.2 (May 28, 2026):** Launched Phase 2B.2 Offline Caching Services. Created compliant browser service worker (`sw.js`) and dynamic register components (`ServiceWorkerRegister.tsx`) to cache static visual frames (CSS/JS files, SVG elements, PDF curricula) while maintaining strict bypass constraints on dynamic patient vitals and Gemini processing. Mounted dynamic status monitors in the Settings tab. Verified 0 build issues.
-   **Version 6.1 (May 28, 2026):** Deployed Phase 2B.1 Offline Resilience Foundations. Integrated real-time local write listeners, client-side metadata persistence utilities, glassmorphic Sync Telemetry Bars, and interactive Sync simulation switches in dashboard & settings panels. Checked and validated zero build compilation errors.
-   **Version 6.0 (May 28, 2026):** Updated current continuity snapshots, added completed Phase 2A Resource Library details, logged the strategic removal of the Vision deck, unified high-fidelity JSON storage schemas, and documented Next.js 16 build exit codes. Fully aligned with developer safety boundaries.
