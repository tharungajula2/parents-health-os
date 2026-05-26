export function loadDemoData() {
    // 1. CLEAR EXISTING DATA
    localStorage.removeItem("parents_health_auth_v2");
    localStorage.removeItem("parents_health_assessment_data_v2");
    localStorage.removeItem("parents_health_history");
    localStorage.removeItem("parents_health_latest_summary");
    localStorage.removeItem("parents_health_active_meds");
    localStorage.removeItem("parents_health_active_parent_id");
    
    // Clear all dynamic parent-scoped and med log keys
    Object.keys(localStorage).forEach((key) => {
        if (
            key.startsWith("parents_health_") || 
            key.startsWith("phos_")
        ) {
            localStorage.removeItem(key);
        }
    });

    // 2. SET AUTH & IDENTITY
    localStorage.setItem("parents_health_auth_v2", "true");
    localStorage.setItem("parents_health_active_parent_id", "sandbox-parent-id");
    localStorage.setItem("parents_health_user_name", "Amma Demo");
    localStorage.setItem("parents_health_user_gender", "Female");
    localStorage.setItem("parents_health_user_age", "61");

    // 3. CLINICAL ASSESSMENT (Mapped to Engine Format)
    const answers = {
        q1: "56-69",           // Age
        q2: "Diabetes",        // Metabolic
        q3: "No",              // Cardio
        q4: "Often",           // Breathless (Asthma)
        q5: "No",              // Neuro
        q6: "No",              // Neuro
        q7: "No",              // Surgery
        q8: "Severe/Daily",    // Pain (Joint/Back/Knee)
        q9: "No",              // Falls
        q10: "No",             // ADL
        q11: "No",             // Gut
        q12: "Sometimes",      // Mood (Stressed/Anxious)
        q13: "Often/Poor",     // Sleep
        q14: "Sometimes",      // Diet
        q15: "One habit"       // Habits
    };

    const scores = {
        total: 75,
        riskLevel: "High Risk: Immediate Action Required",
        categories: [
            { name: "Metabolic", score: 15, max: 15 },
            { name: "Cardiovascular", score: 0, max: 15 },
            { name: "Cognitive", score: 0, max: 20 },
            { name: "Muscular", score: 20, max: 20 },
            { name: "Frailty", score: 0, max: 20 },
            { name: "Digestive", score: 0, max: 10 },
            { name: "Emotional", score: 5, max: 10 },
            { name: "Sleep", score: 10, max: 10 },
            { name: "Lifestyle", score: 5, max: 20 },
            { name: "Resilience", score: 20, max: 35 }
        ]
    };

    const assessmentPayload = {
        answers,
        scores,
        riskLevel: "High Risk: Immediate Action Required",
        riskScore: 75
    };

    localStorage.setItem("parents_health_assessment_data_v2", JSON.stringify(assessmentPayload));
    localStorage.setItem("parents_health_assessment_data_v2_sandbox-parent-id", JSON.stringify(assessmentPayload));

    // 4. ACTIVE MEDICINES
    const meds = [
        {
            id: 'm1', name: 'Glycomet 0.5mg', type: 'Tablet',
            dosage: '500mg', timing: 'Before Breakfast', slots: ['Morning'], instructions: 'Before Breakfast', relationToFood: 'Before Food',
            status: 'Active', category: 'Chronic', is_active: true
        },
        {
            id: 'm2', name: 'Levolin Rotacaps', type: 'Inhaler',
            dosage: '100mcg', timing: 'Before Sleep', slots: ['Night'], instructions: 'Daily - Before Sleep', relationToFood: 'After Food',
            status: 'Active', category: 'Chronic', is_active: true
        },
        {
            id: 'm3', name: 'Combihale FF 100', type: 'Inhaler',
            dosage: '100mg', timing: 'Before Sleep', slots: ['Night'], instructions: 'Daily - Before Sleep', relationToFood: 'After Food',
            status: 'Active', category: 'Chronic', is_active: true
        },
        {
            id: 'm4', name: 'Teczine', type: 'Tablet',
            dosage: '10mg', timing: 'After 6 PM', slots: ['Evening'], instructions: 'After 6 PM (Alt Days)', relationToFood: 'After Food',
            status: 'Active', category: 'Chronic', is_active: true
        },
        {
            id: 'm5', name: 'Excela Max Lotion', type: 'Lotion',
            dosage: 'Apply Generously', timing: 'Morning & Night', slots: ['Morning', 'Night'], instructions: 'For Hand Eczema', relationToFood: 'After Food',
            status: 'Active', category: 'Supportive', is_active: true
        }
    ];
    localStorage.setItem("parents_health_active_meds", JSON.stringify(meds));
    localStorage.setItem("parents_health_active_meds_sandbox-parent-id", JSON.stringify(meds));

    // 5. HISTORY & SMART REPORTS
    const history = [
        {
            meta: { reportDate: "2026-05-20", reportType: "Consultation" },
            date: "2026-05-20", 
            type: "Consultation",
            summary: "Patient reports persistent skin inflammation (Atopic Dermatitis). Asthma triggers noted in winter. HbA1c stable at 6.8%.",
            biomarkers: [
                { name: "HbA1c", value: "6.8", unit: "%", status: "Warning", trend: "Stable" },
                { name: "Eosinophils", value: "High", unit: "", status: "Abnormal" }
            ]
        }
    ];
    localStorage.setItem("parents_health_history", JSON.stringify(history));
    localStorage.setItem("parents_health_history_sandbox-parent-id", JSON.stringify(history));

    // 6. LATEST HOLISTIC SUMMARY
    const holisticSummary = {
        isSummary: true,
        title: "Holistic Health Summary",
        patientRiskProfile: "High Risk Profile: Actively managing **Diabetes** and chronic **inflammatory conditions** (Atopic Dermatitis, Asthma), requiring immediate attention for integrated care.",
        trendAnalysis: "Your reports show you've been **steadily managing your Diabetes**, which is a positive step. However, there's a **clear and ongoing pattern of inflammation and allergic reactions** affecting skin and breathing. Eosinophils are high, pointing to winter-onset allergic asthma inflammation. HbA1c is stable but metabolic profile requires continued checkups.",
        keyFindings: [
            "**Diabetes Management**: Your health assessment showed metabolic risk, and HbA1c is 6.8% (Warning).",
            "**Inflammation and Allergies**: Persistent skin inflammation and Asthma triggers.",
            "**Muscular Health**: Severe joint/back pain reported, impacting mobility."
        ],
        recommendation: "Integrated care plan focusing on anti-inflammatory diet, stress reduction, and strict adherence to Levolin/Combihale. Consult Orthopedist for joint pain.",
        disclaimer: "AI-Generated Summary. Verify with Doctor."
    };
    localStorage.setItem("parents_health_latest_summary", JSON.stringify(holisticSummary));
    localStorage.setItem("parents_health_latest_summary_sandbox-parent-id", JSON.stringify(holisticSummary));

    // 7. CARE COORDINATION SANDBOX SEEDS
    const careTeam = [
        {
            id: "ct-anaya",
            name: "Anaya",
            role: "AI Care Assistant",
            specialty: "Care Coordination & Health Insights",
            languages: ["English", "Hindi", "Telugu"],
            availabilityLabel: "Always active",
            consultModes: ["whatsapp"],
            status: "assigned",
            registrationNumber: "N/A — AI Companion",
            bio: "Coordinates daily care, compiles reports, and triggers proactive alerts. Powered by Parents Health OS.",
            isAI: true
        },
        {
            id: "ct-family-physician",
            name: "Dr. Aruna Desai",
            role: "Family Physician",
            specialty: "General Medicine & Chronic Disease Management",
            languages: ["English", "Hindi"],
            availabilityLabel: "Mon–Sat, 10 AM–1 PM",
            consultModes: ["phone", "video"],
            status: "assigned",
            registrationNumber: "MCI-44928-DEMO",
            bio: "20+ years in family medicine with focus on geriatric chronic care, polypharmacy review, and preventive health for Indian seniors."
        },
        {
            id: "ct-nutritionist",
            name: "Ms. Sanya Kapoor",
            role: "Clinical Nutritionist",
            specialty: "Diabetic & Geriatric Nutrition",
            languages: ["English", "Hindi"],
            availabilityLabel: "Mon, Wed, Fri — 11 AM–1 PM",
            consultModes: ["phone", "whatsapp"],
            status: "assigned",
            registrationNumber: "NUT-88291-DEMO",
            bio: "Diet specialist for diabetic seniors, metabolic tracking, and meal timing aligned with medication schedules."
        },
        {
            id: "ct-physiotherapist",
            name: "Coach Vikram Singh",
            role: "Physiotherapist",
            specialty: "Mobility, Fall Prevention & Strength",
            languages: ["English", "Hindi", "Punjabi"],
            availabilityLabel: "Mon–Fri, 7–9 AM",
            consultModes: ["video", "in-person"],
            status: "assigned",
            registrationNumber: "PHY-99023-DEMO",
            bio: "Specialist in geriatric mobility restoration, fall-prevention programs, chair exercises, and strength recovery."
        }
    ];
    localStorage.setItem("phos_care_team_sandbox-parent-id", JSON.stringify(careTeam));

    const consultRequests = [
        {
            id: "req-1",
            parentId: "sandbox-parent-id",
            memberId: "ct-family-physician",
            memberName: "Dr. Aruna Desai",
            memberRole: "Family Physician",
            reason: "Persistent skin inflammation and diabetic compliance audit",
            urgency: "routine",
            preferredMode: "video",
            preferredLanguage: "English",
            attachments: {
                latestVitals: true,
                activeMedications: true,
                latestReportSummary: true,
                carePlanSummary: true,
                doctorQuestions: true,
                recentMisses: false
            },
            caregiverNotes: "Fasting sugars have been slightly high in mornings. Mom complains of dry skin itchiness during winters. Need to audit HbA1c compliance.",
            status: "completed",
            createdAt: "2026-05-19T10:00:00.000Z",
            updatedAt: "2026-05-20T11:00:00.000Z",
            completedAt: "2026-05-20T11:00:00.000Z"
        },
        {
            id: "req-2",
            parentId: "sandbox-parent-id",
            memberId: "ct-nutritionist",
            memberName: "Ms. Sanya Kapoor",
            memberRole: "Clinical Nutritionist",
            reason: "Diabetic meal pattern planning & morning energy management",
            urgency: "routine",
            preferredMode: "phone",
            preferredLanguage: "English",
            attachments: {
                latestVitals: true,
                activeMedications: true,
                latestReportSummary: false,
                carePlanSummary: true,
                doctorQuestions: false,
                recentMisses: true
            },
            caregiverNotes: "She feels energy drops in late mornings. Request customized diet sheet.",
            status: "scheduled",
            createdAt: "2026-05-24T09:00:00.000Z",
            updatedAt: "2026-05-24T09:00:00.000Z"
        }
    ];
    localStorage.setItem("phos_consult_requests_sandbox-parent-id", JSON.stringify(consultRequests));

    const followups = [
        {
            id: "task-1",
            parentId: "sandbox-parent-id",
            consultId: "req-1",
            label: "Book lab test for follow-up HbA1c",
            category: "lab",
            dueLabel: "Within 7 days",
            isDone: false,
            createdAt: "2026-05-20T11:00:00.000Z"
        },
        {
            id: "task-2",
            parentId: "sandbox-parent-id",
            consultId: "req-1",
            label: "Log morning blood sugar daily",
            category: "vitals",
            dueLabel: "Daily",
            isDone: false,
            createdAt: "2026-05-20T11:00:00.000Z"
        },
        {
            id: "task-3",
            parentId: "sandbox-parent-id",
            consultId: "req-1",
            label: "Purchase nebulizer mask spacer",
            category: "medicine",
            dueLabel: "Within 2 days",
            isDone: true,
            createdAt: "2026-05-20T11:00:00.000Z"
        },
        {
            id: "task-4",
            parentId: "sandbox-parent-id",
            consultId: "req-1",
            label: "Discuss Asthma inhaler technique with Dr. Desai",
            category: "review",
            dueLabel: "At next consult",
            isDone: true,
            createdAt: "2026-05-20T11:00:00.000Z"
        }
    ];
    localStorage.setItem("phos_followup_tasks_sandbox-parent-id", JSON.stringify(followups));

    // 8. SYNTHESIZED CLINICIAN DISCUSSION BRIEF SEED
    const doctorBrief = {
        id: "brief-seed-1",
        parentId: "sandbox-parent-id",
        generatedAt: new Date().toISOString(),
        parentName: "Amma Demo",
        ageLanguage: "61 years, prefers Telugu",
        knownConditions: ["Diabetes Type 2", "Chronic Asthma", "Severe Joint Pain"],
        activeMedications: [
            "Glycomet 0.5mg (Before Breakfast)",
            "Levolin Rotacaps (Before Sleep)",
            "Combihale FF 100 (Before Sleep)",
            "Teczine (After 6 PM)",
            "Excela Max Lotion (Morning & Night)"
        ],
        latestVitals: "BP: 120/80 mmHg, Blood Sugar: 105 mg/dL",
        recentRedFlags: [
            "Reported winter asthma triggers",
            "HbA1c level is in warning range (6.8%)"
        ],
        latestReportSummary: "HbA1c is at 6.8% (Warning). Eosinophils are high, pointing to winter-onset allergic asthma inflammation. HbA1c is stable but metabolic profile requires continued checkups.",
        carePlanStatus: "Care baseline established (Stage A, B, C, D completed).",
        missedTasks: [],
        questionsToAsk: [
            "Is the HbA1c target of < 6.5% safe and realistic given her active joint pain?",
            "Should we step down the Combihale FF 100 inhaler if wheezing resolves in spring?",
            "How do we safely coordinate physiotherapy exercises alongside her respiratory triggers?"
        ],
        caregiverNotes: "Winter triggers cause short breath. Joint pain makes morning walking difficult.",
        disclaimer: "⚠️ This brief is prepared for discussion with a qualified doctor and is NOT medical advice. It is generated from sandbox data for care coordination purposes only."
    };
    localStorage.setItem("phos_doctor_brief_sandbox-parent-id", JSON.stringify(doctorBrief));

    // 9. DAILY LOGS FOR CALENDAR INTERACTION
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    localStorage.setItem("parents_health_daily_log_" + todayStr, JSON.stringify({
        meds: [], 
        vitals: {}  // Clean slate for today
    }));

    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split("T")[0];
    
    // Seed some completed medication records for yesterday
    const yesterdayMedsLog = [
        { id: "m1", taken: true },
        { id: "m2", taken: true },
        { id: "m3", taken: false }, // missed!
        { id: "m4", taken: true }
    ];
    localStorage.setItem("parents_health_med_log_" + yestStr + "_sandbox-parent-id", JSON.stringify(yesterdayMedsLog));
    localStorage.setItem("parents_health_daily_log_" + yestStr, JSON.stringify({
        meds: yesterdayMedsLog,
        vitals: { systolic: 121, diastolic: 80, sugar: 106, weight: 65.0 }
    }));

    alert("Demo Profile & Care Coordination Seeds Loaded: Amma Demo (High Risk / Asthma / Diabetes) 🚀");
    window.location.reload();
}
