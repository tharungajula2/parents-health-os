import { NextResponse } from "next/server";
import { recordMessage, createDirectServerClient, formatIndianPhoneNumber } from "@/lib/whatsapp/service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { parentId, body } = await req.json();

    if (!parentId || !body) {
      return NextResponse.json(
        { success: false, error: "Missing parentId or message body." },
        { status: 400 }
      );
    }

    const supabase = createDirectServerClient() as any;
    let parentName = "Parent";
    let parentPhone = "+919848022338";

    if (supabase) {
      const { data: parentData, error: parentErr } = await supabase
        .from("parents")
        .select("*")
        .eq("id", parentId)
        .single();

      const parent = parentData as any;

      if (parentErr || !parent) {
        return NextResponse.json(
          { success: false, error: "Parent profile not found." },
          { status: 404 }
        );
      }

      parentName = parent.name;
      parentPhone = parent.phone || "+919848022338";
    }

    console.log(`[WhatsApp Simulator] Simulated incoming from ${parentName}: "${body}"`);

    // 1. Record incoming simulated message to DB
    const inboundMsg = await recordMessage({
      parentId,
      direction: "incoming",
      body,
      messageSid: `sim-in-${Date.now()}`,
      status: "simulated",
    });

    // 2. Perform compliance keyword parsing identical to live webhook
    const lowercaseBody = body.toLowerCase().trim();
    let replyText = "";

    if (supabase) {
      // Keyword: Opt-in Consent
      if (lowercaseBody === "yes") {
        await supabase
          .from("consents")
          .upsert({
            parent_id: parentId,
            granted_by_profile_id: parentId, // link to parent context
            consent_type: "geriatric_health_data_processing",
            consent_version: "PHOS_v1.0_WhatsApp",
            ip_address: "whatsapp_simulator",
            is_granted: true
          });

        replyText = `Namaste ${parentName}! 🙏 Your digital consent under the DPDP Act 2023 has been safely registered. Anaya is honored to guide your daily routine.`;
      }
      // Keyword: Opt-out Stop
      else if (lowercaseBody === "no" || lowercaseBody === "stop") {
        await supabase
          .from("consents")
          .update({ is_granted: false })
          .eq("parent_id", parentId)
          .eq("consent_type", "geriatric_health_data_processing");

        replyText = `Understood. 🛡️ I have disabled WhatsApp alerts for ${parentName}. You can opt-in anytime by replying 'YES'.`;
      }
      // Keyword: Medicine Intake compliance logging
      else if (lowercaseBody === "taken" || lowercaseBody === "done") {
        const { data: activeMeds } = await supabase
          .from("medications")
          .eq("parent_id", parentId)
          .eq("is_active", true);

        if (activeMeds && activeMeds.length > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          for (const med of activeMeds) {
            await supabase
              .from("medication_logs")
              .upsert({
                parent_id: parentId,
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
      // Keyword: Vitals readings (e.g. 120/80)
      else if (lowercaseBody.match(/(\d{2,3})\s*[\/\-]\s*(\d{2,3})/)) {
        const match = body.match(/(\d{2,3})\s*[\/\-]\s*(\d{2,3})/);
        if (match) {
          const sys = parseInt(match[1]);
          const dia = parseInt(match[2]);

          await supabase
            .from("vitals")
            .insert({
              parent_id: parentId,
              bp_sys: sys,
              bp_dia: dia,
              source: "whatsapp",
              measured_at: new Date().toISOString()
            });

          replyText = `Thank you for taking care! 🩺 I have logged your Blood Pressure of ${sys}/${dia} mmHg. Let's keep it healthy!`;
        }
      }
    }

    if (!replyText) {
      replyText = `Namaste ${parentName}! 🙏 This is Anaya, your care companion. I have logged your message: "${body}". Have a peaceful day!`;
    }

    // 3. Record outbound simulated reply from Anaya to DB
    const outboundMsg = await recordMessage({
      parentId,
      direction: "outgoing",
      body: replyText,
      messageSid: `sim-out-${Date.now()}`,
      status: "simulated",
    });

    return NextResponse.json({
      success: true,
      inbound: inboundMsg,
      outbound: outboundMsg,
    });

  } catch (err: any) {
    console.error("[WhatsApp Simulator API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to simulate message." },
      { status: 500 }
    );
  }
}
