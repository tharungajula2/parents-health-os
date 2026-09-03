import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Secure server-side only key
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Vercel / Next.js App Router Config
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!apiKey || !genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clinicalContext = formData.get("clinicalContext") as string || "No clinical profile available.";
    const historyContext = formData.get("historyContext") as string || "No previous reports.";
    const mode = formData.get("mode") as string;

    // --- MODE 1: HOLISTIC SUMMARY ---
    if (mode === "summary") {
       let modelString = "gemini-2.5-flash";
       let model = genAI.getGenerativeModel({ model: modelString });
       
       const summaryPrompt = `You are "Parents Health AI", a senior medical data analyst.
       
       OBJECTIVE: Generate a "Holistic Health Summary" for a patient based on their Clinical Profile and Report History.
       
       TONE: 
       - Reassuring, supportive, clear, and objective.
       - Use Simple English suitable for non-medical users (explain any technical parameters in simple terms).
       - Never diagnose or adjust medications. Maintain absolute safety.
       
       INPUTS:
       1. Clinical Profile (Assessment Scores & Answers):
       ${clinicalContext}
       
       2. Report History (Past Lab/Rx Analysis):
       ${historyContext}
       
       TASKS:
       1. **Synthesize:** Combine the clinical profile risks with findings from the report history.
       2. **Filter Noise:** Focus on relevant patterns. Ignore unrelated parameters.
       3. **Connect the Dots:** Highlight how the reports validate or complement the clinical assessment.
       
       OUTPUT FORMAT: You MUST return a valid JSON object matching the following structure exactly. Do not wrap in markdown other than the JSON block:
       \`\`\`json
       {
         "title": "Holistic Health Summary",
         "patientRiskProfile": "Summary of risk profile (e.g. 'Moderate Risk Diabetic')",
         "keyFindings": [
           "**Finding**: Simple explanation of the finding.",
           "**Finding 2**: Simple explanation."
         ],
         "trendAnalysis": "A brief paragraph describing the health trajectory. Use bold for key markers.",
         "recommendation": "One clear, supportive care-focused recommendation."
       }
       \`\`\`
       `;

       let result;
       try {
           result = await model.generateContent(summaryPrompt);
       } catch (error: any) {
           console.warn(`Summary with ${modelString} failed: ${error.message}. Fallback to gemini-2.5-flash-lite.`);
           modelString = "gemini-2.5-flash-lite";
           model = genAI.getGenerativeModel({ model: modelString });
           result = await model.generateContent(summaryPrompt);
       }

       const text = result.response.text();
       
       let jsonString = text;
       const codeBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(text);
       if (codeBlockMatch) {
            jsonString = codeBlockMatch[1];
       } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonString = text.substring(firstBrace, lastBrace + 1);
            }
       }
       
       try {
           return NextResponse.json({ result: JSON.parse(jsonString), modelUsed: modelString });
       } catch (e) {
           return NextResponse.json({ error: "Failed to parse Summary JSON", raw: text }, { status: 500 });
       }
    }

    // --- MODE 2: DOCUMENT ANALYSIS ---
    if (!file) {
      return NextResponse.json(
        { error: "No file provided for document analysis" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/png";

    console.log(`Analyzing file: ${file.name} (${mimeType})`);

    let modelString = "gemini-2.5-flash"; 
    let model = genAI.getGenerativeModel({ model: modelString });

    const prompt = `You are Anaya's care coordination intelligence core for the Care Operations Console.
    Your role is to analyze the attached medical document (lab report, prescription, scan, or discharge summary) and extract structured insights.
    
    TONE & CLINICAL SAFETY MANDATE:
    1. NEVER diagnose, prescribe, or suggest medication adjustments.
    2. Enforce absolute clinical safety: all findings must be presented in a comforting, highly reassuring, yet objective manner. No alarmist language.
    3. Ensure every analysis is watermarked as an AI-generated summary and ends with a clear physician validation disclaimer.
    4. Provide two distinct summaries: one detailed for the care coordinator/coordinator control panel, and one ultra-comforting, simplified, warm summary designed for the elderly parent (suitable for WhatsApp digestion).
    
    Patient Clinical Context (Profile):
    ${clinicalContext}
 
    Medical History (Past Reports Summary):
    ${historyContext}
 
    TASKS:
    1. **Classify Document:** Is it a Lab Report, Prescription, Scan Report, Discharge Summary, or Other?
    2. **Patient Name:** Extract the patient name ONLY if it is clearly visible. If not visible or ambiguous, omit it.
    3. **Biomarker Extraction:** Extract up to 6 key test markers. For each:
       - Provide name, value, unit, standard reference range (if visible).
       - Evaluate status as: normal, high, low, borderline, or unknown.
       - Provide a simple, comforting, ELI5 explanation of what that biomarker represents.
    4. **Medication Extraction:** Identify all medications listed in the document. For each:
       - Extract name, strength (e.g., 500mg), dosage (e.g., 1 tablet), timing (e.g., after food, before food, morning, bedtime), frequency (e.g., once daily, twice daily), duration (e.g., 5 days, chronic, ongoing).
       - Add any special instructions (e.g., avoid dairy, take with water).
       - Assess confidence as high, medium, or low.
       - Set source as "from uploaded report".
    5. **Physician Questions:** Formulate 3 intelligent, supportive questions the family/coordinator can print or ask the doctor at the next checkup.
    6. **Red Flags:** Conservatively highlight any urgent clinical markers needing physical checkups, using extremely gentle, reassuring tone.
    7. **Disclaimers:** Add a standard AI-generated clinical safety verification disclaimer.
 
    OUTPUT FORMAT: You MUST return a valid JSON object matching the following structure exactly. Do not output any prose outside this JSON block:
    \`\`\`json
    {
      "reportType": "Lab Report | Prescription | Scan Report | Discharge Summary | Other",
      "reportDate": "YYYY-MM-DD",
      "patientName": "Name or empty string if not visible",
      "summaryForChild": "Clear explanation of findings in simple English for the care coordinator/family.",
      "summaryForParent": "Ultra-comforting, simplified explanation of the health status suitable for parent digestion via WhatsApp.",
      "keyFindings": [
        "Finding description in supportive simple language."
      ],
      "biomarkers": [
        {
          "name": "Parameter Name",
          "value": "123",
          "unit": "mg/dL",
          "referenceRange": "70 - 100 mg/dL",
          "status": "normal | high | low | borderline | unknown",
          "explanation": "ELI5 simple explainer of this metric."
        }
      ],
      "medicines": [
        {
          "name": "Medication Name",
          "strength": "500mg",
          "dosage": "1 tablet",
          "timing": "after food | before food | morning | bedtime | noon",
          "frequency": "once daily | twice daily | thrice daily",
          "duration": "5 days | chronic | ongoing",
          "instruction": "Special guidelines if present",
          "confidence": "high | medium | low",
          "source": "from uploaded report"
        }
      ],
      "possibleQuestionsForDoctor": [
        "Question to ask"
      ],
      "redFlags": [
        "Gentle warning message"
      ],
      "confidenceLevel": "high | medium | low",
      "disclaimer": "AI-generated summary. Please verify with your doctor. This does not replace clinical advice."
    }
    \`\`\`
    `;

    const analyzeImage = async (selectedModel: any) => {
        return await selectedModel.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
        ]);
    };

    let result;
    try {
        result = await analyzeImage(model);
    } catch (modelError: any) {
        console.warn(`Primary model ${modelString} failed (${modelError.message}), attempting fallback to gemini-2.5-flash-lite`);
        modelString = "gemini-2.5-flash-lite";
        model = genAI.getGenerativeModel({ model: modelString });
        result = await analyzeImage(model);
    }

    const responseText = result.response.text();
    
    let jsonString = responseText;
    const codeBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(responseText);
    if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
    } else {
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonString = responseText.substring(firstBrace, lastBrace + 1);
        }
    }
    
    try {
        const parsedResult = JSON.parse(jsonString);
        return NextResponse.json({ result: parsedResult, modelUsed: modelString });
    } catch (e) {
        return NextResponse.json(
          { error: "Failed to parse JSON response from Gemini", rawText: responseText },
          { status: 500 }
        );
    }

  } catch (error: any) {
    console.error("Parents Health AI Analysis Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze the report.", 
        details: error.message || String(error) 
      },
      { status: 500 }
    );
  }
}
