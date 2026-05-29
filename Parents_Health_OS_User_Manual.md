# Parents Health OS — Complete User Manual

Welcome to **Parents Health OS**, a family health operating system designed to bridge the gap between children living in one city and their parents living in another. This manual is written for complete beginners. Whether you are an investor, a caregiver, or a stakeholder exploring the app for the first time, this guide will walk you through every single click, dropdown, tab, and concept within the application.

## 🌟 The Vision

The core philosophy of Parents Health OS is simple: **How does a child take care of their parent's daily health without asking the parent to download an app, create a password, or change their routine?** 

The answer relies on three surfaces:
1. A **Web Dashboard** for the child (This application).
2. A **WhatsApp Companion** for the parent (Seamless daily check-ins without an app).
3. **AI (Anaya)** that connects them, translating medical complexity into family simplicity.

---

## 🚀 Getting Started & Loading Demo Data

Currently, Parents Health OS runs in a **Secure Sandbox Mode**. This means all data is stored locally on your device (in your browser) to ensure maximum privacy and security during evaluation. There are no external databases connected in this demo version.

### How to Load Demo Data
When you first open the application, it will likely be pre-loaded with our carefully crafted Sandbox data. We have injected two distinct simulated parent profiles:
*   **Amma Demo:** A 61-year-old mother managing Type 2 Diabetes, Chronic Asthma, and Joint Pain.
*   **Papa Demo:** A 72-year-old father with a baseline of Mild Hypertension.

### How to Reset the System
If you want to experience the app completely from scratch (as a brand new user):
1. Scroll down to the bottom left corner of the screen (or check inside your profile settings).
2. Click the **Reset System** button. 
3. This will wipe all local demo data and bring you directly to the New User Onboarding wizard.

---

## 🗺️ The Big Picture: Navigating the OS

Parents Health OS is designed to be comprehensive but not overwhelming. As a son or daughter, **you do not need to check every single page every day.**

### The Role of Anaya (AI Care Companion)
**How Anaya Helps You:** Anaya is the bridge between you and your parents. Instead of you having to constantly call and nag your parents with questions like *"Did you take your pill?"* or *"What was your blood pressure today?"*, Anaya handles this gracefully. 
*   Anaya chats with your parents on WhatsApp in their native language (e.g., Hindi, Telugu).
*   Anaya asks them about their day, gently reminds them to take their medications, and collects their vital readings.
*   Anaya then synthesizes all this information and populates the **Dashboard** and **Daily Care Logs** for you to review at your convenience. 

### What You Should Focus On
*   **The Main Dashboard (Home):** This is your daily bread and butter. **For 95% of your days, the Dashboard is the only page you need to visit.** It gives you a bird's-eye view of your parent's health, combining alerts, recent vitals, and medication adherence all in one place.
*   **Daily Care Logs:** Visit this page if you want to see the granular breakdown of today's specific checklist, or if you want to manually mark off a medication that Anaya missed.
*   **Reports & Insights:** Use this page when preparing for a doctor's visit, or when you want to look at long-term health trends (e.g., blood sugar levels over the last 3 months).
*   **Care Team (Consult Hub) vs Clinic Hub:** 
    *   **Care Team:** This is for clinical collaboration. You go here to generate medical reports, prepare questions for doctors, and review simulated consult logic.
    *   **Clinic Hub:** This is for logistics and finances. You go here to schedule specific appointments, check the family wallet balance, and review insurance coverage.

---

## 📖 Complete Application Walkthrough

Every tab, button, and field explained in detail.

### 1. Onboarding & Clinical Assessment Engine
When starting fresh, the system asks the child to complete a **Clinical Assessment Engine** profiling protocol. 

*   **How it Works:** You will be guided through a 15-point questionnaire covering clinical dimensions like metabolic health, fall risk, and cognitive function. 
*   **Filling the Fields:** The questions are designed in plain English and are divided into four stages:
    *   **Stage A (Setup):** You must provide *Relation to you*, *Numeric Age*, *Primary Language*, *Mobility Support Needs*, *Major Diagnosed Conditions* (Diabetes, Hypertension, Heart Issues, Kidney Condition, Thyroid, Asthma/COPD, Arthritis, None), *Known Allergies*, and *Emergency/Doctor Contact Details*.
    *   **Stage B (Functional ADLs - Optional):** Asks if the parent is "Independent" or "Needs help" with *Bathing & Showering*, *Dressing*, *Toileting & Continence*, *Transferring & Mobility*, *Walking Up Stairs*, and *Eating & Feeding*.
    *   **Stage C (Daily Risk Signals - Optional):** Yes/No questions regarding *Falls in past 12 Months*, *Dizziness & Fainting*, *Breathlessness on exertion*, *Forgetfulness / Confusion*, *Low Mood / Loneliness*, *Poor Sleep Quality*, *Appetite / Weight Loss*, *Constipation / Bloating*, and *Severe Joint Pain*.
    *   **Stage D (Routine Preferences - Optional):** Asks for *Wake-up Time*, *WhatsApp Language Preference*, *Blood Pressure Frequency*, *Sugar Frequency*, *Hydration Target*, and *Exercise Reminder*.
*   **The Result (How the Composite Care Index is Calculated):** The system generates a composite **Health Index Score** by summing risk factors across 10 categories. The exact scoring mechanism is as follows:
    *   **Metabolic:** +15 if Diabetic.
    *   **Cardiovascular:** +10 if Hypertensive, +15 for Heart Issues.
    *   **Resilience:** +15 if Age >= 70, +10 if Age >= 56, +5 if Age >= 40. +10 for Dizziness, +10 for Breathlessness.
    *   **Frailty & Muscular:** +5 to +15 depending on mobility level (e.g., +15 for bedridden). +5 Frailty for every Stage B ADL where the parent "Needs help". +10 Frailty for a recent fall. +10 Muscular for severe joint pain.
    *   **Cognitive:** +10 for forgetfulness.
    *   **Emotional:** +10 for low mood.
    *   **Sleep:** +10 for poor sleep.
    *   **Digestive:** +5 for appetite loss, +5 for constipation.
    *   **Lifestyle:** +10 if exercise reminders are disabled.
    *   *Total Score determines the Tier:*
        *   **0-20:** Healthy Baseline (Green)
        *   **21-40:** Moderate Attention (Amber)
        *   **41+:** High Risk: Action Required (Red)
*   **Why it Matters:** This score calibrates how the app behaves, deciding if the parent needs daily check-ins or weekly routine checks.

### 2. Main Dashboard & Profile Switcher
This is the child's Command Center. 

*   **Profile Switcher (Top Left Dropdown):** Click this dropdown to switch between "Amma Demo" and "Papa Demo" (or add a new parent). **Every piece of data on the screen is isolated.** Switching profiles instantly swaps the active medications, vitals, and health index.
*   **Status Cards (Top Section):** 
    *   **Active Medications:** Shows the total number of pills required (e.g., "3 daily").
    *   **Today's Compliance:** A circular progress wheel showing how many meds were taken today (e.g., "66%").
    *   **Latest Vitals:** Quick snapshot of recent BP, Blood Sugar, and Weight.
    *   **Health Index:** The score generated from the Assessment Engine (e.g., "45 High Risk").
    *   *Color Coding:* Green (on track), Amber (needs attention), Red (action required).

### 3. Daily Care Logs
Located in the left sidebar, this tab manages the day-to-day routine.

*   **Medication Checklist:** Broken down by time slots (Morning, Afternoon, Evening, and Night). 
    *   *Buttons & Fields:* Each medication is a clickable card showing the drug name and dosage (e.g., "Metformin 500mg"). Clicking it crosses it out and updates the progress ring at the top (`X / Y Completed`). A success notification will appear.
*   **Vitals Quick Log:** A simple form to manually log daily metrics.
    *   *Fields:* `Blood Pressure (Systolic/Diastolic)`, `Blood Glucose (mg/dL)`, `Weight (kg)`, and an optional `Notes` text field.
*   **Simulated Wearable Integrations (Demo Feature):** 
    *   *Buttons:* Under the Freestyle Libre 3 card, click **"SYNC CGM"** to instantly autofill the blood sugar field with simulated data (e.g., 110 mg/dL). Under the Apple Watch Ultra card, click **"SYNC SMARTWATCH"** to autofill active calories and weight. 
*   **Save Action:** Click the **"Save Daily Log"** button at the top or bottom of the page to permanently save today's actions to the parent's profile.
*   **Simulated Wearable Integrations (Demo Feature):** 
    *   *How to use:* Scroll down to the Wearables section. Click **"SYNC CGM"** (Continuous Glucose Monitor) to instantly autofill the blood sugar field with simulated data (e.g., 110 mg/dL). Click **"SYNC SMARTWATCH"** to autofill active calories and weight. This demonstrates how effortless data collection will be in the future.
*   **Save Daily Log Button:** Click this at the top to permanently save today's actions to the parent's profile.

### 4. Smart Reports & Insights
Located in the left sidebar, this is where the AI layer (Anaya) shines.

*   **Glycemic Control / Vitals Trajectory:** A visual graph showing historical data points (e.g., Fasting Blood Sugar and HbA1c over months). It allows you to toggle different timeframes.
*   **Smart Diagnostic Upload (Simulation):** In this sandbox, you can view a pre-analyzed lab report card. 
    *   *Fields & UI Elements:* It displays the Report Title, Date, and a list of parsed biomarkers. Biomarkers have color-coded badges (e.g., Green "Normal", Amber "Elevated"). It also provides a plain-English "AI Summary" paragraph.
    *   *How it works in full production:* A user clicks an **Upload Report** button to attach a PDF or image of a lab report. Google Gemini (our AI model) reads the document, extracts biomarkers, contextualizes them against the parent's age, generates the summary, and detects newly prescribed medicines to add to the tracker automatically.

### 5. WhatsApp Demo (Care Companion)
Located in the left sidebar, this tab simulates the parent's experience.

*   **WhatsApp Gateway Status Badge:** Found at the top, indicating the sandbox connection status.
*   **Automated Reminders & Checks Registry:** A list of pre-configured message templates.
    *   *Available Templates:* "BP Measurement Request", "Morning Medication Check", "General Health Check-in".
    *   *Buttons:* Next to each template is a **"Dispatch Template"** button. Clicking this changes its state to "DISPATCHING..." and then "DISPATCHED".
*   **Simulated WhatsApp Mobile Device Preview:** On the right side of the screen is a visual mockup of a mobile phone. When you dispatch a template, you will see a simulated WhatsApp chat thread appear here, showing Anaya asking a question in a local language (e.g., Hindi/Telugu) and the parent's simulated response.
*   **The Future Vision:** In production, this connects to the real WhatsApp Business API. Parents can send a voice note saying "I took my medicine, but my knee hurts." The AI transcribes it, marks the medication as 'taken' in the dashboard, and logs 'knee pain' as a symptom.

### 6. Care Team & Consult Hub
Located in the left sidebar, this tab connects the family to healthcare professionals.

*   **Assigned Team Tab:** Shows cards for active specialists (e.g., Dr. Sharma - Geriatrician, Dr. Verma - Cardiologist, and Anaya - AI Care Companion).
*   **Consult Hub Tab:** Used to schedule mock consultations and log summary notes.
    *   *Fields:* Includes date pickers, doctor selection dropdowns, and text areas for consultation notes.
*   **Doctor Brief Tab:** A bridge between the digital app and a physical doctor visit.
    *   *Buttons:* Click **"Generate Doctor Brief"**. The app pulls all recent vitals, active medications, and abnormal lab results into a clean, structured document on the screen.
    *   *Buttons:* Click **"Print / Export PDF"** to save the brief locally, so it can be sent to the parent on WhatsApp to hand directly to the doctor.

### 7. Settings & Backup
Located at the bottom of the left sidebar.

*   **Profile Management:** Options to update personal details.
*   **Privacy & Data Controls:** 
    *   *Buttons:* Includes options to **Download Backup (JSON)** of all local data, and an **Erase All Data** button to wipe records in compliance with India's Digital Personal Data Protection Act (DPDPA).

---

## 🔮 Beyond the Prototype (The Production Vision)

Because you are exploring the **Sandbox Demo**, some features are simulated to provide a flawless demonstration without requiring backend setups. Here is exactly what happens when Parents Health OS moves to full production:

1.  **From Local Storage to Supabase:** Currently, data lives in your browser. In production, data is stored securely in **Supabase** (hosted in Mumbai for data residency compliance). It uses Row-Level Security, meaning even developers cannot accidentally query a family's private health data.
2.  **From Simulated WhatsApp to Meta Cloud API:** The WhatsApp simulator will be replaced by the official WhatsApp Business Cloud API. Real messages, real voice notes, and real photo parsing (e.g., sending a photo of a BP machine screen to automatically log the numbers).
3.  **Real-Time AI Voice Pipeline:** Summaries of complex lab reports won't just be text on a dashboard. They will be translated and converted into warm, human-like voice notes sent directly to the parent's WhatsApp in their mother tongue.

---

## ❓ Need Help?
If you ever get lost during your walkthrough, simply navigate to the bottom left and click **Reset System** to start from the beginning. Enjoy exploring the future of family eldercare!
