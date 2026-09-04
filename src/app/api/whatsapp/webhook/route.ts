import { NextResponse } from "next/server";
import crypto from "crypto";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import { createServiceRoleClient } from "@/lib/whatsapp/service";
import { maskPhoneNumber } from "@/lib/whatsapp/client";
import { handleWhatsAppDeliveryStatusUpdate } from "@/lib/whatsapp/status";

export const dynamic = 'force-dynamic';

/**
 * Verifies HMAC SHA-256 signature from Meta (x-hub-signature-256 header).
 */
function verifyMetaSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }
  const signature = signatureHeader.substring(7);
  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

// 1. Meta Webhook Verification Handshake (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = getWhatsAppConfig();

  if (mode === "subscribe" && token && config.verifyToken && token === config.verifyToken) {
    console.log("[WhatsApp Webhook] Verification handshake successful.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("[WhatsApp Webhook] Verification handshake failed. Invalid verify_token.");
  return new Response("Forbidden", { status: 403 });
}

// 2. Inbound WhatsApp Event Handler (POST)
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const config = getWhatsAppConfig();

    // Verify Meta request signature using WHATSAPP_APP_SECRET
    if (config.appSecret) {
      const signatureHeader = req.headers.get("x-hub-signature-256");
      const isValid = verifyMetaSignature(rawBody, signatureHeader, config.appSecret);

      if (!isValid) {
        console.warn("[WhatsApp Webhook] Invalid request signature rejected.");
        return new Response("Unauthorized signature", { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ success: true, message: "Ignored non-whatsapp event." });
    }

    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    const statuses = value?.statuses;

    // Process Meta delivery status receipts (sent / delivered / read / failed)
    if (Array.isArray(statuses) && statuses.length > 0) {
      const serviceClient = createServiceRoleClient();
      for (const statusObj of statuses) {
        const statusId = statusObj?.id;
        const incomingStatus = statusObj?.status;
        if (statusId && incomingStatus) {
          await handleWhatsAppDeliveryStatusUpdate(serviceClient, statusId, incomingStatus);
        }
      }
    }

    if (!message) {
      return NextResponse.json({ success: true });
    }

    // Extract quick-reply button payload if present
    let buttonPayload: string | null = null;

    if (message.type === "interactive" && message.interactive?.type === "button_reply") {
      buttonPayload = message.interactive.button_reply?.id || null;
    } else if (message.type === "button") {
      buttonPayload = message.button?.payload || null;
    }

    // Free-text or unhandled message handling (NO AI CHATBOT)
    if (!buttonPayload) {
      const maskedSender = maskPhoneNumber(message.from);
      console.log(`[WhatsApp Webhook] Received free-text message from ${maskedSender}. Logged safely without AI response.`);
      return NextResponse.json({ success: true, status: "ignored_free_text" });
    }

    // Controlled payload formats:
    // med:<medication_event_uuid>:taken|skipped|snoozed
    // routine:<care_routine_event_uuid>:completed|skipped|snoozed
    const medMatch = buttonPayload.match(/^med:([0-9a-fA-F-]{36}):(taken|skipped|snoozed)$/);
    const routineMatch = buttonPayload.match(/^routine:([0-9a-fA-F-]{36}):(completed|skipped|snoozed)$/);

    if (!medMatch && !routineMatch) {
      console.warn(`[WhatsApp Webhook] Rejected unauthorized/malformed button payload: "${buttonPayload}"`);
      return NextResponse.json({ success: true, status: "ignored_malformed_payload" });
    }

    const serviceClient = createServiceRoleClient() as any;
    if (!serviceClient) {
      console.error("[WhatsApp Webhook] Service-role database client offline.");
      return NextResponse.json({ success: false, error: "Database offline" }, { status: 500 });
    }

    const nowIso = new Date().toISOString();

    if (medMatch) {
      const eventId = medMatch[1];
      const newStatus = medMatch[2]; // taken | skipped | snoozed

      // Idempotent update on medication_events
      const { error: updateErr } = await serviceClient
        .from("medication_events")
        .update({
          status: newStatus,
          responded_at: nowIso,
          response_source: "whatsapp",
          updated_at: nowIso,
        })
        .eq("id", eventId);

      if (updateErr) {
        console.error(`[WhatsApp Webhook] Failed to update medication_event ${eventId}:`, updateErr.message);
      } else {
        console.log(`[WhatsApp Webhook] Updated medication_event ${eventId} status -> ${newStatus} via WhatsApp button`);
      }
    } else if (routineMatch) {
      const eventId = routineMatch[1];
      const newStatus = routineMatch[2]; // completed | skipped | snoozed

      // Idempotent update on care_routine_events
      const { error: updateErr } = await serviceClient
        .from("care_routine_events")
        .update({
          status: newStatus,
          responded_at: nowIso,
          response_source: "whatsapp",
          updated_at: nowIso,
        })
        .eq("id", eventId);

      if (updateErr) {
        console.error(`[WhatsApp Webhook] Failed to update care_routine_event ${eventId}:`, updateErr.message);
      } else {
        console.log(`[WhatsApp Webhook] Updated care_routine_event ${eventId} status -> ${newStatus} via WhatsApp button`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[WhatsApp Webhook POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
