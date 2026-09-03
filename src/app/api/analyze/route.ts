import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on server." },
        { status: 500 }
      );
    }

    // 1. Authenticate Request
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server authentication error." }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await req.json().catch(() => null);
    const documentId = body?.documentId || body?.healthDocumentId;

    if (!documentId) {
      return NextResponse.json({ error: "health_document_id is required." }, { status: 400 });
    }

    // 3. Resolve Document & Verify Authorization Boundary
    const { data: document, error: docError } = await supabase
      .from("health_documents")
      .select("*, care_recipients(*)")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Health document not found." }, { status: 404 });
    }

    const familyId = document.care_recipients?.family_id;
    if (!familyId) {
      return NextResponse.json({ error: "Invalid document lineage." }, { status: 400 });
    }

    // Verify user is active family member of that document's family
    const { data: member } = await supabase
      .from("family_members")
      .select("id, role")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!member) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to analyze this family's document." },
        { status: 403 }
      );
    }

    // 3.5 Duplicate Call Protection: Check if document already has pending_review or approved extraction
    const { data: existingExtraction } = await supabase
      .from("document_extractions")
      .select("*")
      .eq("health_document_id", document.id)
      .in("review_status", ["pending_review", "approved"])
      .order("extracted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingExtraction) {
      return NextResponse.json({
        success: true,
        extractionId: existingExtraction.id,
        extraction: existingExtraction,
        modelUsed: existingExtraction.model_version,
        reused: true
      });
    }

    // 4. Download file bytes from Supabase Private Storage using Admin Client
    const adminSupabase = createAdminClient();
    const storageClient = adminSupabase || supabase;

    const { data: fileData, error: storageErr } = await storageClient.storage
      .from("health-documents")
      .download(document.storage_path);

    if (storageErr || !fileData) {
      console.error("Storage download error:", storageErr);
      return NextResponse.json(
        { error: "Failed to retrieve document file from private storage." },
        { status: 500 }
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = document.mime_type || "application/pdf";

    // 5. Initialize Official @google/genai SDK & Model Contract: gemini-3.5-flash-lite
    const ai = new GoogleGenAI({ apiKey });

    const extractionSchema = {
      type: Type.OBJECT,
      properties: {
        document_type: {
          type: Type.STRING,
          description: "Type of document: Lab Report, Prescription, Discharge Summary, Scan Report, or Other",
        },
        document_date: {
          type: Type.STRING,
          description: "Explicit date on the document in YYYY-MM-DD format if present, else null",
        },
        provider_or_hospital: {
          type: Type.STRING,
          description: "Name of doctor, clinic, or hospital explicitly listed on document",
        },
        medications: {
          type: Type.ARRAY,
          description: "List of medications explicitly stated in document",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of medication" },
              dosage: { type: Type.STRING, description: "Dosage/strength e.g. 500mg or 1 tablet" },
              instructions: { type: Type.STRING, description: "Explicit instructions e.g. after meals" },
              frequency: { type: Type.STRING, description: "Frequency e.g. once daily" },
            },
            required: ["name"],
          },
        },
        conditions: {
          type: Type.ARRAY,
          description: "List of diagnoses or health conditions explicitly stated in document",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Condition or diagnosis name" },
              status: { type: Type.STRING, description: "Status if explicitly mentioned e.g. active, resolved" },
            },
            required: ["name"],
          },
        },
        measurements: {
          type: Type.ARRAY,
          description: "Lab measurements, vitals, or biomarkers explicitly stated in document",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of test or measurement e.g. HbA1c, Blood Glucose" },
              value: { type: Type.STRING, description: "Value recorded e.g. 112" },
              unit: { type: Type.STRING, description: "Unit e.g. mg/dL, mmHg" },
              reference_range: { type: Type.STRING, description: "Explicit reference range if printed on document" },
            },
            required: ["name", "value"],
          },
        },
        follow_up_instructions: {
          type: Type.ARRAY,
          description: "Explicit follow-up advice or next appointments stated in document",
          items: { type: Type.STRING },
        },
        summary: {
          type: Type.STRING,
          description: "Conservative factual summary of document content without medical interpretation or diagnosis",
        },
        uncertainties: {
          type: Type.ARRAY,
          description: "List of unreadable, ambiguous, cropped, or blurry sections in the document",
          items: { type: Type.STRING },
        },
      },
      required: [
        "document_type",
        "medications",
        "conditions",
        "measurements",
        "follow_up_instructions",
        "summary",
        "uncertainties",
      ],
    };

    const prompt = `You are Parents Health OS Document Intelligence Core.
Your role is to perform strict, factual health document extraction for family care coordination.

CLINICAL SAFETY & EXTRACTION MANDATE:
1. NEVER diagnose, prescribe, or suggest medication adjustments.
2. NEVER infer a fact that is not explicitly supported by the document. When uncertain or ambiguous, return null or list it under uncertainties.
3. Extract only what is explicitly written in the attached document.
4. Keep the summary objective, calm, and reassuring. No alarmist language.`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
      },
    });

    const responseText = geminiResponse.text || "{}";
    let extractedData = {};
    try {
      extractedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini output JSON:", responseText);
      extractedData = {
        summary: responseText,
        uncertainties: ["Output parsing required manual review."],
        document_type: "Other",
        medications: [],
        conditions: [],
        measurements: [],
        follow_up_instructions: [],
      };
    }

    // 6. Save as Untrusted Extraction in public.document_extractions using privileged server admin client
    const targetAdminClient = adminSupabase || supabase;
    const { data: extraction, error: insertErr } = await targetAdminClient
      .from("document_extractions")
      .insert({
        health_document_id: document.id,
        ai_provider: "Google Gemini",
        model_version: "gemini-3.5-flash-lite",
        extracted_data: extractedData,
        review_status: "pending_review",
        extracted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr || !extraction) {
      console.error("Error creating document_extractions row:", insertErr);
      return NextResponse.json({ error: "Failed to persist extraction record." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      extractionId: extraction.id,
      extraction: extraction,
      modelUsed: "gemini-3.5-flash-lite",
    });
  } catch (err: any) {
    console.error("Parents Health AI Route Exception:", err);
    return NextResponse.json(
      { error: "Internal server error during document analysis.", details: err.message || String(err) },
      { status: 500 }
    );
  }
}
