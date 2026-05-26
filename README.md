# Parents Health OS: The Context-Aware Health OS for the Elderly
**Current Version:** 2.2+ (Premium Dark Glassmorphism & Neural Typography Edition)

![Parents Health OS Dashboard](https://via.placeholder.com/1200x600?text=Parents-Health+OS+Dark+Glassmorphism+Interface)

---

## 🚀 The Core Innovation: "Context-Awareness"

Most health apps see medical data in isolation. If a patient has blood sugar of `160 mg/dL`, a standard app flags it as "High".
**Parents Health OS** interprets data through its **Clinical Engine** first. It sees:
> *"Patient is 75 years old + has a history of hypoglycemia (low sugar falls)."*

It then intelligently decides:
> *"For this specific patient, 160 is actually a SAFE target to prevent fatal falls. Do not alarm."*

This **System Context** is what separates Parents-Health from generic AI wrappers. It builds a digital twin of the patient to provide personalized, clinical-grade insights, now presented through a world-class **Dark Glassmorphism UI** with high-contrast **Neural Typography**.

---

## 🌟 Key Features (v2.2+)

### 1. 🩺 Health Assessment (Clinical Engine)
*   **Establish Baseline:** A 15-question geriatric assessment (covering 10 clinical pillars) calculates a personalized **Risk Score (0-175)**.
*   **AI Calibration:** The system's AI sensitivity and alert thresholds are calibrated based on this clinical profile.

### 2. 🏥 Clinic Hub (Clinical Operations)
*   **Protocol Schedule:** Streamlined glassmorphic interface for booking geriatric specialists and care team nodes.
*   **Parents-Health Senior Shield:** Integrated insurance wallet system with real-time operational credit management.

### 📄 Diagnostics & Trends (Smart Reports)
*   **Gemini AI Engine:** Deep neural analysis of PDFs, lab reports, and medical artifacts using Google Gemini 2.5 Flash.
*   **Neural Narrative:** Synthesizes months of medical history into a single, cohesive clinical story.

### 4. 💊 Wellness Hub (Daily Protocol)
*   **Adherence Tracking:** Proactive medication management with premium "Tick to Take" logging and "Relation to Food" logic.
*   **IoT Synchronization:** Real-time dual-sync simulation for **FreeStyle Libre (CGM)** and **Apple Watch**.

### 💬 WhatsApp Bot (Neural Companion)
*   A zero-learning-curve interface demonstrating how seniors can interact with Parents Health OS using familiar tools (WhatsApp), re-imagined with a premium dark frame.

---

## 🎨 Design System: "Neural Glass"
*   **Aesthetic:** Deep slate backgrounds (`slate-950`) with translucent `backdrop-blur-xl` layers.
*   **Typography:** High-contrast **Clean White** headers (`font-black`) for maximum legibility in geriatric contexts.
*   **Accents:** Cyan and Blue glowing blueprint grids to represent clinical precision.

---

## 🛠 Tech Stack
*   **Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS 4 + Framer Motion 12
*   **AI Engine:** Google Gemini 2.5 Flash (Context-Aware Multimodal)
*   **Storage:** `LocalStorage` (100% Client-Side Privacy)

---

## ⚡ Getting Started
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/tharungajula2/parents-health-os.git
    cd parents-health-os
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Launch:**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`. No password required (Sandbox Mode).

---

## 🔐 Privacy & Security
*   **Zero-Server Storage:** All medical data stays in the user's browser via `localStorage`.
*   **Privacy Secure:** Technical badges in footer confirm local-first execution.

---

## 🔒 Project Safety & Agent Rules

This repository has strict guardrails to prevent accidental database operations on protected live projects.

| Document | Purpose |
|---|---|
| [`PROJECT_SAFETY_LOCK.md`](./PROJECT_SAFETY_LOCK.md) | Hard safety boundary — protected projects, forbidden operations, env rules |
| [`AGENT_RULES.md`](./AGENT_RULES.md) | AI agent operational rules — read before every session |
| [`LIVE_BACKEND_PREFLIGHT.md`](./LIVE_BACKEND_PREFLIGHT.md) | Step-by-step process for future live Supabase backend migration |

> **Current backend mode:** Sandbox / localStorage only. No live Supabase project is connected.
> The protected project `trelis-life` must never be used for Parents Health OS.

---

**Designed & Conceptualized by [Tharun Gajula](https://github.com/tharungajula2)**
*Strategic Vision Prototype for Geriatrics & Clinical Product Architecture.*
