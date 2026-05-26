# Parents Health OS — Sandbox Demo Guide 🌟
## High-Fidelity Geriatric Care Oversight Platform (Sandbox)

Welcome to the ultimate walkthrough and evaluation guide for **Parents Health OS**. The platform operates completely in a **secure, high-fidelity Sandbox / Local-First mode**, giving caregivers full control over simulating real-world Indian eldercare scenarios without touching external servers.

This guide provides step-by-step instructions to run a complete end-to-end sandbox demonstration.

---

## 📋 Table of Contents
1. [🚀 Quick Start & Setup](#-quick-start--setup)
2. [🧑‍🤝‍🧑 Part A: Dual-Profile Isolation & Switcher](#-part-a-dual-profile-isolation--switcher)
3. [📅 Part B: Daily Care Checklist & Real-Time Sync Simulators](#-part-b-daily-care-checklist--real-time-sync-simulators)
4. [📊 Part C: Smart Diagnostic Reports & Biomarkers](#-part-c-smart-diagnostic-reports--biomarkers)
5. [💬 Part D: Simulated WhatsApp Sandbox Companion](#-part-d-simulated-whatsapp-sandbox-companion)
6. [🏥 Part E: Care Team & Doctor Consultation Hub](#-part-e-care-team--doctor-consultation-hub)
7. [⚡ Part F: System Reset & Onboarding Walkthrough](#-part-f-system-reset--onboarding-walkthrough)
8. [🏗️ Verification & Production Compilation](#-verification--production-compilation)

---

## 🚀 Quick Start & Setup

The app is built using **Next.js** and **React**. To launch the development environment locally:

```bash
# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or [http://localhost:3001](http://localhost:3001) if port 3000 is occupied) in your web browser.

---

## 🧑‍🤝‍🧑 Part A: Dual-Profile Isolation & Switcher

Parents Health OS features a **secure profile boundary** between two simulated parent records. It is fully reactive, keeping vitals, logs, active medications, lab history, and messaging context 100% separate.

### Walkthrough Steps:
1. Locate the **Parent Profile Selector** at the top left of the dashboard.
2. The default profile is **Amma Demo** (Mother, 61yo, diagnosed with Type 2 Diabetes, Chronic Asthma, and Joint Pain).
3. Click the dropdown and switch to **Papa Demo** (Father, 72yo, Mild Hypertension baseline).
4. Notice how the entire dashboard, condition tags, health index scorecard, and vitals list instantly swap to reflect the new parent's state.

---

## 📅 Part B: Daily Care Checklist & Real-Time Sync Simulators

The **Daily Care Logs** tab organizes medication checklists, vital checks, and daily habits. It includes dry-run device sync integrations with clinical wearables.

### Walkthrough Steps:
1. Navigate to **Daily Care Logs** in the left sidebar.
2. Click any pending task, such as **Take Metformin (500mg)**. Notice the task immediately crosses out, updates the top progress rings (e.g. `1 / 3 Completed`), and triggers a premium toast notification in the bottom right.
3. Scroll to the **Simulated Wearable Integrations** card.
4. Click **SYNC CGM** on the **Freestyle Libre 3** integration. Notice the system instantly prefills `110 mg/dL` fasting glucose with a sync success toast!
5. Click **SYNC SMARTWATCH** on the **Apple Watch Ultra** integration. Vitals like active calories (`45 min`), weight (`64.5 kg`), and hydration are synced automatically.
6. Click **Save Daily Log** at the top to commit this state per parent.

---

## 📊 Part C: Smart Diagnostic Reports & Biomarkers

The **Smart Reports & Insights** engine analyzes uploaded laboratory PDFs (simulated) and extracts biomarkers using interactive metrics.

### Walkthrough Steps:
1. Navigate to **Reports & Insights** in the left sidebar.
2. Observe the **Glycemic Control Trajectory** chart showing the history of Fasting Blood Sugar and HbA1c.
3. Review the parsed laboratory biomarkers card. Notice that warning values are highlighted in **amber** or **red** (e.g., Fasting Sugar at `145 mg/dL`).
4. Switch parents to **Papa Demo** and notice that his report and trajectory parameters change to hypertensive trends.

---

## 💬 Part D: Simulated WhatsApp Sandbox Companion

Elders in India communicate heavily through WhatsApp. Parents Health OS includes a high-fidelity **WhatsApp Sandbox Gateway** to simulate automated vital checks, medication reminders, and caregiver notifications.

### Walkthrough Steps:
1. Navigate to **WhatsApp Demo** in the left sidebar.
2. Look at the **WhatsApp Gateway status badge** at the top: `Parents Health OS Sandbox // Simulated Data Only`.
3. Choose a template under the **Automated Reminders & Checks Registry**, such as the **BP Measurement Request** template.
4. Click **Dispatch Template**. The button status updates to `DISPATCHING...`, then displays `DISPATCHED`.
5. Look at the **Simulated WhatsApp Mobile Device Preview** on the right. A new conversation thread will appear showing the real-time reminder dispatched and the parent's simulated response!

---

## 🏥 Part E: Care Team & Doctor Consultation Hub

This tab coordinates assigned specialists, simulates consultations with Indian doctors, and generates structured briefs to optimize doctor time.

### Walkthrough Steps:
1. Navigate to **Care Team** in the left sidebar.
2. View **Assigned Team** showing active specialists (e.g., geriatricians, cardiologists, and AI Care Companion Anaya).
3. Toggle to **Consult Hub**. You can schedule a mock consultation or log a new care summary.
4. Toggle to the **Doctor Brief** tab.
5. Click **Generate Doctor Brief**. The sandbox engine parses the parent's conditions, active medications, wearable logs, and recent abnormal biomarkers to instantly render a structured clinical document.
6. Click **Print / Export PDF** to generate a clean, print-ready layout of the brief.

---

## ⚡ Part F: System Reset & Onboarding Walkthrough

If you want to start the demo flow completely from scratch:
1. Locate the **Reset System** button at the bottom left footer (or inside the profile settings).
2. Click **Reset System**. This clears all custom local storage modifications and seeds default profiles.
3. You will be redirected to the **Onboarding Wizard**.
4. Fill in the **Stage A (Quick Assessment)** and **Stage B (Detailed Clinical Assessment)** forms to set up a new custom parent baseline!

---

## 🏗️ Verification & Production Compilation

To ensure the system compiles cleanly for production:

```bash
# Execute a clean production build
npm run build
```

This ensures TypeScript validation, Next.js routing, static optimization, and ESLint rule compliance are 100% correct and ready for immediate server deployment.

---

> [!NOTE]  
> **Platform Security Guardrails Active**  
> Under the repository safety guidelines, live database updates are restricted. The system will continue operating fully and safely in simulated Sandbox mode. Enjoy the demo!
