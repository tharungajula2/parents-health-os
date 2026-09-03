# Parents Health OS: Definitive Operator Manual & Master Reference

Welcome to the official **First Family Care Operations Console** (Parents Health OS) Operator Manual. This document is written for complete beginners—including operational staff, coordinators, healthcare representatives, and presenters. No prior knowledge of software development, eldercare, or the Parents Health OS platform is required. By reading this manual, you will learn how to initialize, operate, demonstrate, and migrate this console from end to end.

---

## 1. Product Concept & Philosophy

### 1.1 What is Parents Health OS?
Parents Health OS is a **company-side, internal Care Operations Console** designed for care team coordinators managing the health and wellness of elderly parents in India. It is built to bridge the gap between clinical complexity (such as laboratory values and medication schedules) and day-to-day caregiving operations.

Instead of exposing aging parents to complex digital apps or bombarding adult children with clinical alarms, the system operates on a segmented workflow model:
*   **The Parent Experience (WhatsApp-First):** The parent does not use this console. They interact solely with **Anaya** (the Care Automation Assistant) via simple WhatsApp templates in their preferred language (English or Hindi).
*   **The Adult Child Experience (Family Snapshot View):** The child (sponsor) does not see this complete operations console. Instead, they receive a simplified, high-level **Family Snapshot View** containing medication confirmations, vital trends, coordinator logs, and Doctor Briefs.
*   **The Care Team Experience (This Console):** The care operations team utilizes this comprehensive console to monitor alerts, prepare clinician visits, schedule medical consultations, and triage warnings.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PARENTS HEALTH OS WORKFLOW                        │
├───────────────────┬─────────────────────────────┬──────────────────────┤
│ Parent            │ Care Team Coordinator       │ Adult Child (Sponsor)│
│ (WhatsApp-First)  │ (Care Operations Console)   │ (Family Snapshot)    │
│                   │                             │                      │
│ • Simple chats    │ • Triage dashboard          │ • Reassuring feeds   │
│ • Automated cues  │ • Clinical brief generator  │ • Call-back requests │
│ • Log via buttons │ • Onboarding & lab audits   │ • Med confirmations │
└───────────────────┴─────────────────────────────┴──────────────────────┘
```

### 1.2 Geriatric & Clinical Context
Elderly care requires specific design considerations:
*   **Preventing Hyper-Alarmism:** Generic apps flag high readings as "dangerously high." However, in geriatric care, keeping a diabetic senior’s blood glucose slightly elevated (e.g., `150–160 mg/dL`) is often a deliberate clinical choice to prevent **hypoglycemia** (low sugar), which causes dizziness, balance loss, and catastrophic falls. The platform’s clinical engine filters warning thresholds based on chronic condition baselines to avoid inducing panic.
*   **Triage and Response Levels:** Rather than declaring emergencies, the dashboard uses warmer, clinical-coordination branding. The highest priority state is labeled **Urgent Follow-up** (instead of "Critical") to keep focus on supportive care and triage.

### 1.3 India DPDP Compliance
Under India's **Digital Personal Data Protection (DPDP) Act, 2023**, senior health data must be handled with strict sovereignty:
*   **Explicit Consent:** Diagnostic reports, medication files, and clinical questions are never analyzed by external AI tools (such as Google Gemini) unless the caregiver checks the explicit DPDPA opt-in box.
*   **Local Sovereignty:** In local sandbox mode, all personal health records (PHRs) are processed on-device and stored in the browser's `localStorage` as a zero-knowledge local vault.
*   **Audit Trail Ledger:** The system logs every consent approval, modification, and revocation in an internal tamper-proof audit log to maintain compliance.

---

## 2. Getting Started: Installation & Startup

Follow these steps to run the console on your local computer.

### 2.1 System Prerequisites
*   **Node.js:** Version `18.17.0` or higher.
*   **Web Browser:** Google Chrome, Microsoft Edge, or Mozilla Firefox.

### 2.2 Installation Steps
Open your terminal (PowerShell, Command Prompt, or Bash) and run the following commands:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/tharungajula2/parents-health-os.git
    cd parents-health-os
    ```

2.  **Install Node Modules:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file in the project root named `.env.local` and add your Google Gemini API key:
    ```bash
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```
    *Note: If no Gemini key is provided, the application will fallback to high-fidelity mocks for lab report analysis, ensuring the demo still functions.*

4.  **Run the Local Server:**
    ```bash
    npm run dev
    ```

5.  **Open the Web Console:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 3. Product Architecture & Safety Guards

### 3.1 Local Sandbox vs. Supabase Cloud Mode
Parents Health OS runs in two states based on configuration:
*   **Local Sandbox Mode (Default):** Runs entirely within the browser. Data is saved in the browser’s `localStorage`. No cloud backend is active.
*   **Supabase Cloud Mode:** Activated when valid Supabase environment variables are provided in `.env.local`. It links the console to a live Postgres database.

### 3.2 Offline Resilience & Sync Queue
When operating offline or in sandbox mode, the client caches updates locally.
*   **Sync Queue:** Updates (vitals logged, intake completed, consent modified) generate a `SyncEvent` stored in a local transaction log queue.
*   **Queue Size Limits:** The queue dynamically limits storage to `100` events to prevent exceeding browser memory quotas.
*   **Simulated Sync:** Users can click **Simulate Sync** in the sync settings to transition events from `pending` to `simulated_synced` to demonstrate cloud sync behavior.

### 3.3 Database Safety Guards
To protect other live databases (such as the separate production client `trelis-life` with ID `lhqtqofjrqoyscobsfud`), the client checks the Supabase URL on startup. If the environment variables point to the protected project reference, the application throws an immediate safety error and blocks connection.

---

## 4. Dashboard & Module Navigation Tour

The console features a persistent left-hand navigation sidebar. Below is the step-by-step operational guide for each page:

```
                  ┌───────────────────────────────┐
                  │      CONSOLE SIDEBAR          │
                  ├───────────────────────────────┤
                  │ 1. Command Center             │
                  │ 2. First Family Intake        │
                  │ 3. Baseline Health Camp       │
                  │ 4. Family Records             │
                  │ 5. WhatsApp Automation        │
                  │ 6. Care Logs                  │
                  │ 7. Care Operations Board      │
                  │ 8. Reports & Records          │
                  │ 9. Doctor Briefs              │
                  │ 10. Consults                  │
                  │ 11. Settings & Backup         │
                  └───────────────────────────────┘
```

### 4.1 Command Center
The core monitoring screen for the operations team.
*   **Sandbox Status Bar:** Top banner indicating `SANDBOX DATA VAULT // ACTIVE`. This confirms that all data modifications remain localized.
*   **Care Priority Status Controls:** Quick triage toggle to update the parent’s current risk status:
    *   `Stable`: Green baseline level.
    *   `Watch`: Yellow mild warning alert.
    *   `Urgent Follow-up`: Orange warning status. Selecting this activates critical notification panels.
*   **WhatsApp Monitor Alert Box:** A notification box that appears when the priority status changes, indicating automated WhatsApp interventions are active.
*   **Family Snapshot View Card:** Explains the product boundary—illustrating that the full console is for internal staff, while the family caregiver gets a simplified view.

### 4.2 First Family Intake
The onboarding module to register a parent on the system:
1.  Enter the parent's name, age, primary WhatsApp number, and city.
2.  Add baseline health conditions (e.g., Diabetes, Hypertension).
3.  **DPDPA Consent Checklist:** Explicitly toggle consent to allow diagnostic reports and vitals monitoring.
4.  Click **Save & Sync to Local Console** to create a parent-scoped sandbox workspace.

### 4.3 Baseline Health Camp
A community camp registry used to capture initial screenings before full registration:
*   Click **Register Camp Attendee** to record systolic/diastolic blood pressure, pulse, weight, and random blood sugar.
*   **Sync Indicators:** Attendees show `SYNCED` when saved to browser database storage or `PENDING SYNC` if waiting in the temporary camp cache.

### 4.4 Family Records
Detailed medical baseline registry:
*   Displays medical histories, schedules, and active questionnaires.
*   Allows operators to edit demographics and modify baseline thresholds.

### 4.5 WhatsApp Automation
Mock simulator to verify automated parent communications:
*   Displays a smartphone frame mockup showing the conversation with the parent.
*   **Interactive Simulation:** Click option buttons inside the WhatsApp simulator (e.g., *Log BP*, *Mark morning meds taken*) to send simulated messages that instantly update the parent's health state on the console dashboard.
*   **Language Selection:** Toggle templates between English and Hindi.

### 4.6 Care Logs
Compliance monitoring and local backup utility:
*   Shows medication adherence charts and daily checklists.

### 4.7 Care Operations Board
The incident management console for coordinators:
*   Lists escalated alerts sorted by priority levels.
*   Provides action scripts (e.g., Simulated Sponsor SMS templates) to guide follow-up calls with families.
*   Allows coordinators to dispatch warnings or mark alerts as resolved.

### 4.8 Reports & Records
Diagnostic document manager:
*   **Upload Lab Report:** Upload diagnostic PDFs or image files.
*   **AI Report Analysis:** Click **Analyze Report** (via Gemini API). If a Gemini key is missing, a high-fidelity mock report processes to simulate findings: HbA1c (7.2%) and elevated LDL cholesterol (135 mg/dL).
*   **Extracted Biomarkers:** Displays parsed laboratory values, reference ranges, and simple "ELI5" explanations.
*   **Questions for Doctor:** Generates questions to print for the next consultation.

### 4.9 Doctor Briefs
Pre-consultation workflow workspace:
*   **Specialist Roster:** View assigned medical experts.
*   **Doctor Briefs Tab:** Click **Generate Doctor Brief** to compile a list of doctor-ready questions based on current reports, vitals, and medication lists.
*   **Clinical Disclaimer:** Banners outline that briefs are collaborative discussion guides rather than medical diagnosis sheets.

### 4.10 Consults
Finance and booking manager:
*   **Book Appointment:** Book diagnostic appointments with geriatricians, cardiologists, or nutritionists.
*   **Praan Family Wallet:** Displays the family’s wallet balance. Click **Top Up** to add simulated funds (₹1,000 increments) to test billing flows.

### 4.11 Settings & Backup
System configurations and local database backup workspace:
*   Allow coordinators to export or restore `.json` database snapshots and review offline transaction sync counts.

---

## 5. Live Demo & Investor Pitch Script (5-7 Minutes)

Use this narrative script to demonstrate Parents Health OS during presentations:

*   **Step 1: Set the Hook (Command Center)**
    *   *Action:* Open `http://localhost:3000`. Show the green **Command Center**.
    *   *Script:* *"Most healthcare systems for seniors induce anxiety by showing raw clinical alerts. Parents Health OS is an internal Care Operations Console designed for care teams coordinating care in India. The parent remains WhatsApp-first, and the child receives a simplified status snapshot."*
*   **Step 2: Onboard a Parent (First Family Intake)**
    *   *Action:* Navigate to **First Family Intake**. Enter: Name `Devaki Devi`, Age `72`, conditions: `Type 2 Diabetes`, check the DPDPA Consent toggle, and click **Save & Sync**.
    *   *Script:* *"Onboarding is fast and fully compliant with India's DPDP Act of 2023. Data remains isolated in our browser's local sandbox vault until sync is enabled."*
*   **Step 3: Run the Health Camp (Baseline Camp)**
    *   *Action:* Click **Baseline Health Camp**. Point out the attendee queue and the `SYNCED` and `PENDING SYNC` status indicators.
    *   *Script:* *"Coordinators can capture initial vitals during local health camps and sync attendees directly to their permanent records."*
*   **Step 4: Intervene & Escalate (WhatsApp Simulator)**
    *   *Action:* Go to **Command Center**, set the priority to `Urgent Follow-up`. Navigate to **WhatsApp Automation**.
    *   *Script:* *"If the parent's status escalates, the WhatsApp Automation monitor activates. The parent interacts through simple chat cues on their phone, which automatically update our care console."*
    *   *Action:* Click *Log BP* in the phone mockup. Watch the console receive the message.
*   **Step 5: Generate a Doctor Brief (Doctor Briefs)**
    *   *Action:* Go to **Doctor Briefs**, click **Doctor Briefs** tab, and click **Generate Doctor Brief**.
    *   *Script:* *"Instead of generating diagnostic claims which can hallucinate, our engine compiles a Doctor Brief. It provides the coordinator with exact questions to print and ask during the next physical doctor consultation."*
*   **Step 6: Secure & Backup (Settings & Backup)**
    *   *Action:* Click **Settings & Backup**, or click **Care Logs** to export a portable JSON file.
    *   *Script:* *"We guarantee complete data sovereignty. Operators can export or restore encrypted database backups with a single click."*

---

## 6. Database Schema Reference

The system is configured to map to 14 relational database tables. When deploying to a live Supabase backend, the database tables must align with these definitions:

### 6.1 `profiles`
Tracks coordinator credentials and system roles.
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('caregiver', 'doctor', 'admin'))
);
```

### 6.2 `families`
Groups caregivers and parents into care workspaces.
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id)
);
```

### 6.3 `family_members`
Links caregiver profiles to families.
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.4 `parents`
Monitored profiles for elderly parents.
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  assessment_answers JSONB,
  risk_score INTEGER DEFAULT 0,
  whatsapp_number TEXT
);
```

### 6.5 `consents`
Records regulatory compliance consents under the India DPDP Act.
```sql
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES profiles(id),
  consent_type TEXT NOT NULL, -- e.g. 'gemini_report_analysis'
  status TEXT CHECK (status IN ('granted', 'revoked')) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE
);
```

### 6.6 `vitals`
Saves systolic/diastolic blood pressure, pulse, weight, and blood sugar logs.
```sql
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  logged_by UUID REFERENCES profiles(id),
  bp_sys INTEGER,
  bp_dia INTEGER,
  sugar INTEGER,
  sugar_context TEXT CHECK (sugar_context IN ('fasting', 'post_prandial', 'random')),
  pulse INTEGER,
  weight NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);
```

### 6.7 `medications`
Pharmacological prescriptions active for the parent.
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  timing TEXT, -- morning, bedtime, afternoon, etc.
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.8 `medication_logs`
Tracks whether medications were administered successfully.
```sql
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  logged_by UUID REFERENCES profiles(id),
  taken BOOLEAN NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  scheduled_date DATE NOT NULL,
  notes TEXT
);
```

### 6.9 `lab_reports`
AI diagnostic report summaries and parsed biomarker profiles.
```sql
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  summary_for_child TEXT,
  summary_for_parent TEXT,
  key_findings TEXT[],
  biomarkers JSONB, -- stores values, normal ranges, and explanations
  possible_questions TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  consent_id UUID REFERENCES consents(id)
);
```

### 6.10 `doctors`
Medical specialists assigned to the family care team.
```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  hospital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.11 `care_teams`
Maps doctor profiles to the corresponding parent records.
```sql
CREATE TABLE care_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  role_description TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.12 `ai_conversations`
Maintains care assistant dialogue history.
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_role TEXT CHECK (message_role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.13 `whatsapp_messages`
Inbound/outbound message log history for the WhatsApp simulation.
```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'failed')) NOT NULL
);
```

### 6.14 `audit_log`
Compliance monitoring audit log.
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address TEXT,
  details JSONB
);
```

---

## 7. Migration Checklist: Moving to Live Supabase

When transitioning the console from local sandbox mode to a live database, follow this checklist:

### Phase 1: Supabase Setup
1.  Log in to [Supabase](https://supabase.com) and create a new project named `parents-health-os`.
2.  Choose the `ap-south-1` region (Mumbai, India) to reduce latency and comply with DPDPA expectations.
3.  Note the database connection URL and your API keys.

### Phase 2: Schema Migration
1.  Navigate to the **SQL Editor** in the Supabase Dashboard.
2.  Paste and run the DDL statements from Section 6 to generate all 14 tables.
3.  Run the following commands to enable Row-Level Security (RLS) policies on all tables:
    ```sql
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE families ENABLE ROW LEVEL SECURITY;
    ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
    ```

### Phase 3: Client Update
1.  Open `.env.local` in the project root.
2.  Uncomment and fill out the connection variables:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=https://your-parents-health-os-ref.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_actual_supabase_publishable_key_here
    SUPABASE_SECRET_KEY=your_actual_supabase_secret_key_here
    ```
3.  Verify the connection: Start the application (`npm run dev`) and open the console. The settings panel should update from *Local Sandbox* to *Connected* or *Cloud Synchronized*.
4.  Run a final build check before deployment:
    ```bash
    npm run build
    ```
