import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient, sendMedicationReminder, sendCareRoutineReminder } from "@/lib/whatsapp/service";
import { formatIndianPhoneNumber, maskPhoneNumber } from "@/lib/whatsapp/client";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const supabaseUser = await createClient();
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Caregiver authentication required." },
        { status: 401 }
      );
    }

    // 2. Parse payload (NO arbitrary recipient phone or arbitrary text body allowed)
    const body = await req.json();
    const { careRecipientId, eventType, eventId } = body;

    if (!careRecipientId) {
      return NextResponse.json(
        { success: false, error: "Missing required careRecipientId parameter." },
        { status: 400 }
      );
    }

    // 3. Service role client for verified database operations
    const serviceClient = createServiceRoleClient() as any;
    if (!serviceClient) {
      return NextResponse.json(
        { success: false, error: "Server database client initialization failed." },
        { status: 500 }
      );
    }

    // 4. Verify care recipient exists & user is an active family member
    const { data: recipient, error: recipErr } = await serviceClient
      .from("care_recipients")
      .select("id, family_id, display_name, phone, primary_language")
      .eq("id", careRecipientId)
      .single();

    if (recipErr || !recipient) {
      return NextResponse.json(
        { success: false, error: "Care recipient profile not found." },
        { status: 404 }
      );
    }

    const { data: membership, error: memberErr } = await serviceClient
      .from("family_members")
      .select("id, role, status")
      .eq("family_id", recipient.family_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memberErr || !membership) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You are not an active member of this care recipient's family." },
        { status: 403 }
      );
    }

    // 5. Validate recipient phone number format strictly
    const formattedPhone = formatIndianPhoneNumber(recipient.phone);
    if (!formattedPhone) {
      return NextResponse.json(
        {
          success: false,
          error: `WhatsApp dispatch blocked: Care recipient ${recipient.display_name} does not have a valid E.164 phone number configured.`
        },
        { status: 400 }
      );
    }

    // 6. Find target event or prepare test reminder payload
    let sendResult;
    let targetEventId: string | null = null;
    let targetCategory: "medication" | "routine" = eventType === "routine" ? "routine" : "medication";

    if (eventId) {
      targetEventId = eventId;
      if (targetCategory === "medication") {
        const { data: medEvent } = await serviceClient
          .from("medication_events")
          .select("id, due_at, status, schedule:medication_schedules(local_time, medication:medications(name, dosage, care_recipient_id))")
          .eq("id", eventId)
          .single();

        const medData = medEvent as any;
        if (medData && medData.schedule?.medication?.care_recipient_id === careRecipientId) {
          sendResult = await sendMedicationReminder({
            eventId: medData.id,
            medicationName: medData.schedule.medication.name,
            dosage: medData.schedule.medication.dosage,
            localTime: medData.schedule.local_time || "8:00 AM",
            recipientName: recipient.display_name,
            recipientPhone: formattedPhone,
          });
        }
      } else {
        const { data: routineEvent } = await serviceClient
          .from("care_routine_events")
          .select("id, due_at, status, schedule:care_routine_schedules(local_time, routine:care_routines(name, care_recipient_id))")
          .eq("id", eventId)
          .single();

        const routineData = routineEvent as any;
        if (routineData && routineData.schedule?.routine?.care_recipient_id === careRecipientId) {
          sendResult = await sendCareRoutineReminder({
            eventId: routineData.id,
            routineName: routineData.schedule.routine.name,
            localTime: routineData.schedule.local_time || "7:00 AM",
            recipientName: recipient.display_name,
            recipientPhone: formattedPhone,
          });
        }
      }
    }

    // If no specific eventId provided or resolved, query latest pending event for this care recipient
    if (!sendResult) {
      // Try finding pending medication event
      const { data: pendingMed } = await serviceClient
        .from("medication_events")
        .select("id, due_at, status, schedule:medication_schedules!inner(local_time, medication:medications!inner(name, dosage, care_recipient_id))")
        .eq("status", "pending")
        .eq("schedule.medication.care_recipient_id", careRecipientId)
        .order("due_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const medData = pendingMed as any;
      if (medData) {
        targetEventId = medData.id;
        targetCategory = "medication";
        sendResult = await sendMedicationReminder({
          eventId: medData.id,
          medicationName: medData.schedule.medication.name,
          dosage: medData.schedule.medication.dosage,
          localTime: medData.schedule.local_time || "8:00 AM",
          recipientName: recipient.display_name,
          recipientPhone: formattedPhone,
        });
      } else {
        // Try finding pending routine event
        const { data: pendingRoutine } = await serviceClient
          .from("care_routine_events")
          .select("id, due_at, status, schedule:care_routine_schedules!inner(local_time, routine:care_routines!inner(name, care_recipient_id))")
          .eq("status", "pending")
          .eq("schedule.routine.care_recipient_id", careRecipientId)
          .order("due_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        const routineData = pendingRoutine as any;
        if (routineData) {
          targetEventId = routineData.id;
          targetCategory = "routine";
          sendResult = await sendCareRoutineReminder({
            eventId: routineData.id,
            routineName: routineData.schedule.routine.name,
            localTime: routineData.schedule.local_time || "7:00 AM",
            recipientName: recipient.display_name,
            recipientPhone: formattedPhone,
          });
        } else {
          // Send test reminder event payload targeting registered recipient phone
          const testUuid = crypto.randomUUID();
          targetCategory = "medication";
          sendResult = await sendMedicationReminder({
            eventId: testUuid,
            medicationName: "Test Care Reminder",
            dosage: "1 dose",
            localTime: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            recipientName: recipient.display_name,
            recipientPhone: formattedPhone,
          });
        }
      }
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error || "Meta WhatsApp Cloud API dispatch failed." },
        { status: 502 }
      );
    }

    // 7. Update reminder sent state on database event if targetEventId exists
    if (targetEventId && sendResult.messageId) {
      const nowIso = new Date().toISOString();
      if (targetCategory === "medication") {
        await serviceClient
          .from("medication_events")
          .update({
            reminder_sent_at: nowIso,
            reminder_message_id: sendResult.messageId,
            reminder_delivery_status: "sent",
          })
          .eq("id", targetEventId);
      } else {
        await serviceClient
          .from("care_routine_events")
          .update({
            reminder_sent_at: nowIso,
            reminder_message_id: sendResult.messageId,
            reminder_delivery_status: "sent",
          })
          .eq("id", targetEventId);
      }
    }

    return NextResponse.json({
      success: true,
      recipientName: recipient.display_name,
      recipientPhoneMasked: maskPhoneNumber(formattedPhone),
      messageId: sendResult.messageId,
    });
  } catch (err: any) {
    console.error("[WhatsApp Send API] Internal Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process WhatsApp request." },
      { status: 500 }
    );
  }
}
