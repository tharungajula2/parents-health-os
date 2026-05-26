import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import { formatIndianPhoneNumber, recordMessage, createDirectServerClient } from "@/lib/whatsapp/service";

export const dynamic = 'force-dynamic';

// 1. Meta Webhook Verification Handshake
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = getWhatsAppConfig();

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("[WhatsApp Webhook] Handshake verified successfully.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("[WhatsApp Webhook] Handshake authentication failed.");
  return new Response("Forbidden", { status: 403 });
}

// 2. Incoming Messages & Status Updates Hook
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Check if it is a WhatsApp object event
    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ success: true, message: "Ignored non-whatsapp event." });
    }

    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Could be a status update event (sent/delivered/read)
      const statusObj = value?.statuses?.[0];
      if (statusObj) {
        const msgSid = statusObj.id;
        const status = statusObj.status;
        
        const supabase = createDirectServerClient() as any;
        if (supabase) {
          await supabase
            .from("whatsapp_messages")
            .update({ status })
            .eq("message_sid", msgSid);
        }
      }
      return NextResponse.json({ success: true });
    }

    const rawFrom = message.from;
    const cleanedPhone = formatIndianPhoneNumber(rawFrom);
    const body = message.text?.body || "";
    const messageSid = message.id;

    console.log(`[WhatsApp Webhook] Inbound from ${cleanedPhone}: "${body}"`);

    const supabase = createDirectServerClient() as any;
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database client offline." }, { status: 500 });
    }

    // Match sender to an active parent profile
    const { data: parentData, error: parentErr } = await supabase
      .from("parents")
      .select("*")
      .or(`phone.eq.${cleanedPhone},phone.eq.${cleanedPhone.replace("+", "")},phone.eq.${cleanedPhone.slice(3)}`)
      .limit(1)
      .maybeSingle();

    const parent = parentData as any;

    if (!parent) {
      console.warn(`[WhatsApp Webhook] Unmapped sender phone: ${cleanedPhone}`);
      return NextResponse.json({ success: true, warning: "Sender number not mapped to any family parent profile." });
    }

    // 1. Log inbound message in the messages table
    await recordMessage({
      parentId: parent.id,
      direction: "incoming",
      body,
      messageSid,
      status: "received",
    });

    // 2. Compliance Keyword processing
    const lowercaseBody = body.toLowerCase().trim();
    let replyText = "";

    // Keyword: Consent Opt-in
    if (lowercaseBody === "yes") {
      // Upsert consent record
      await supabase
        .from("consents")
        .upsert({
          parent_id: parent.id,
          granted_by_profile_id: parent.family_id, // link to family context
          consent_type: "geriatric_health_data_processing",
          consent_version: "PHOS_v1.0_WhatsApp",
          ip_address: "whatsapp_webhook",
          is_granted: true
        });

      replyText = `Namaste ${parent.name}! 🙏 Your digital consent under the DPDP Act 2023 has been safely registered. Anaya is honored to guide your daily routine.`;
    }
    // Keyword: Consent Opt-out
    else if (lowercaseBody === "no" || lowercaseBody === "stop") {
      await supabase
        .from("consents")
        .update({ is_granted: false })
        .eq("parent_id", parent.id)
        .eq("consent_type", "geriatric_health_data_processing");

      replyText = `Understood. 🛡️ I have disabled WhatsApp alerts for ${parent.name}. You can opt-in anytime by replying 'YES'.`;
    }
    // Keyword: Medication taken logging
    else if (lowercaseBody === "taken" || lowercaseBody === "done") {
      const { data: activeMeds } = await supabase
        .from("medications")
        .eq("parent_id", parent.id)
        .eq("is_active", true);

      if (activeMeds && activeMeds.length > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        for (const med of activeMeds) {
          // Check if there is an option like Morning/Evening matching
          await supabase
            .from("medication_logs")
            .upsert({
              parent_id: parent.id,
              medication_id: med.id,
              log_date: todayStr,
              taken: true,
              taken_at: new Date().toISOString(),
              source: "whatsapp_companion"
            });
        }
      }

      replyText = `Dhanyavad! 🙏 I have marked your medications as TAKEN for today. Keep up the excellent routine!`;
    }
    // Keyword: Blood Pressure readings log
    else if (lowercaseBody.match(/(\d{2,3})\s*[\/\-]\s*(\d{2,3})/)) {
      const match = body.match(/(\d{2,3})\s*[\/\-]\s*(\d{2,3})/);
      if (match) {
        const sys = parseInt(match[1]);
        const dia = parseInt(match[2]);

        await supabase
          .from("vitals")
          .insert({
            parent_id: parent.id,
            bp_sys: sys,
            bp_dia: dia,
            source: "whatsapp",
            measured_at: new Date().toISOString()
          });

        replyText = `Thank you for taking care! 🩺 I have logged your Blood Pressure of ${sys}/${dia} mmHg. Let's keep it healthy!`;
      }
    }
    // Default reply text (Anaya AI dialogue simulator reply)
    else {
      replyText = `Namaste ${parent.name}! 🙏 This is Anaya, your care companion. I have logged your message: "${body}". Have a peaceful day!`;
    }

    // 3. Dispatch automated reply from Anaya back to parent
    if (replyText) {
      const config = getWhatsAppConfig();
      const formattedPhone = formatIndianPhoneNumber(rawFrom);
      
      // Send message
      if (config.isDryRun || !config.isConfigured) {
        console.log(`[WhatsApp Dry Run Outbound] ${formattedPhone}: "${replyText}"`);
        await recordMessage({
          parentId: parent.id,
          direction: "outgoing",
          body: replyText,
          messageSid: `auto-reply-${Date.now()}`,
          status: "dry_run",
        });
      } else {
        // Live send
        try {
          const url = `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: rawFrom.replace("+", ""),
              type: "text",
              text: { body: replyText }
            })
          });
          
          const resData = await response.json();
          if (response.ok) {
            await recordMessage({
              parentId: parent.id,
              direction: "outgoing",
              body: replyText,
              messageSid: resData.messages?.[0]?.id,
              status: "sent",
            });
          }
        } catch (err) {
          console.error("[WhatsApp Webhook] Automated response failed:", err);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[WhatsApp Webhook POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
