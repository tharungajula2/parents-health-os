import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import {
  createServiceRoleClient,
  sendMedicationReminder,
  sendCareRoutineReminder,
  claimReminderEvent,
  releaseReminderEventClaim,
  markReminderEventSent,
} from "@/lib/whatsapp/service";
import { formatIndianPhoneNumber } from "@/lib/whatsapp/client";

export const dynamic = 'force-dynamic';

// 5-minute stale lease threshold for process crash recovery
const STALE_LEASE_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const config = getWhatsAppConfig();
    const cronSecret = config.reminderCronSecret;

    // 1. Verify cron secret security header
    const authHeader = req.headers.get("authorization") || "";
    const customHeader = req.headers.get("x-cron-secret") || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";

    const providedSecret = bearerToken || customHeader;

    if (!cronSecret || !providedSecret || providedSecret !== cronSecret) {
      console.warn("[WhatsApp Scheduler] Unauthorized reminder execution attempt.");
      return NextResponse.json({ success: false, error: "Unauthorized scheduler access." }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient() as any;
    if (!serviceClient) {
      return NextResponse.json({ success: false, error: "Database client offline." }, { status: 500 });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const staleThresholdIso = new Date(now.getTime() - STALE_LEASE_MS).toISOString();

    // 15-minute window into the future for upcoming due events, up to 2 hours past due
    const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    let processedCount = 0;
    let sentCount = 0;
    let errorCount = 0;

    // 2. Process Pending Medication Events (unclaimed OR stale lease)
    const { data: pendingMedEvents } = await serviceClient
      .from("medication_events")
      .select(`
        id,
        due_at,
        status,
        schedule:medication_schedules!inner(
          local_time,
          medication:medications!inner(
            name,
            dosage,
            is_active,
            care_recipient:care_recipients!inner(
              id,
              display_name,
              phone
            )
          )
        )
      `)
      .eq("status", "pending")
      .is("reminder_sent_at", null)
      .or(`reminder_delivery_status.is.null,and(reminder_delivery_status.eq.pending,updated_at.lte.${staleThresholdIso})`)
      .gte("due_at", windowStart)
      .lte("due_at", windowEnd);

    if (pendingMedEvents && pendingMedEvents.length > 0) {
      for (const event of pendingMedEvents as any[]) {
        processedCount++;
        const med = event.schedule?.medication;
        const recip = med?.care_recipient;

        if (!med || !med.is_active || !recip || !recip.phone) {
          continue;
        }

        const formattedPhone = formatIndianPhoneNumber(recip.phone);
        if (!formattedPhone) {
          console.warn(`[WhatsApp Scheduler] Care recipient ${recip.display_name} phone invalid. Skipping event ${event.id}`);
          continue;
        }

        // Atomically claim event before calling Meta Cloud API and receive persisted CAS leaseToken
        const claimResult = await claimReminderEvent(
          serviceClient,
          'medication_events',
          event.id,
          nowIso,
          staleThresholdIso
        );

        if (!claimResult.success || !claimResult.leaseToken) {
          console.log(`[WhatsApp Scheduler] Medication event ${event.id} already claimed by concurrent worker. Skipping.`);
          continue;
        }

        const leaseToken = claimResult.leaseToken;

        const res = await sendMedicationReminder({
          eventId: event.id,
          medicationName: med.name,
          dosage: med.dosage,
          localTime: event.schedule?.local_time || "8:00 AM",
          recipientName: recip.display_name,
          recipientPhone: formattedPhone,
        });

        if (res.success && res.messageId) {
          sentCount++;
          await markReminderEventSent(serviceClient, 'medication_events', event.id, res.messageId, leaseToken);
        } else {
          errorCount++;
          await releaseReminderEventClaim(serviceClient, 'medication_events', event.id, leaseToken);
        }
      }
    }

    // 3. Process Pending Care Routine Events (unclaimed OR stale lease)
    const { data: pendingRoutineEvents } = await serviceClient
      .from("care_routine_events")
      .select(`
        id,
        due_at,
        status,
        schedule:care_routine_schedules!inner(
          local_time,
          routine:care_routines!inner(
            name,
            is_active,
            care_recipient:care_recipients!inner(
              id,
              display_name,
              phone
            )
          )
        )
      `)
      .eq("status", "pending")
      .is("reminder_sent_at", null)
      .or(`reminder_delivery_status.is.null,and(reminder_delivery_status.eq.pending,updated_at.lte.${staleThresholdIso})`)
      .gte("due_at", windowStart)
      .lte("due_at", windowEnd);

    if (pendingRoutineEvents && pendingRoutineEvents.length > 0) {
      for (const event of pendingRoutineEvents as any[]) {
        processedCount++;
        const routine = event.schedule?.routine;
        const recip = routine?.care_recipient;

        if (!routine || !routine.is_active || !recip || !recip.phone) {
          continue;
        }

        const formattedPhone = formatIndianPhoneNumber(recip.phone);
        if (!formattedPhone) {
          console.warn(`[WhatsApp Scheduler] Care recipient ${recip.display_name} phone invalid. Skipping event ${event.id}`);
          continue;
        }

        // Atomically claim event before calling Meta Cloud API and receive persisted CAS leaseToken
        const claimResult = await claimReminderEvent(
          serviceClient,
          'care_routine_events',
          event.id,
          nowIso,
          staleThresholdIso
        );

        if (!claimResult.success || !claimResult.leaseToken) {
          console.log(`[WhatsApp Scheduler] Care routine event ${event.id} already claimed by concurrent worker. Skipping.`);
          continue;
        }

        const leaseToken = claimResult.leaseToken;

        const res = await sendCareRoutineReminder({
          eventId: event.id,
          routineName: routine.name,
          localTime: event.schedule?.local_time || "7:00 AM",
          recipientName: recip.display_name,
          recipientPhone: formattedPhone,
        });

        if (res.success && res.messageId) {
          sentCount++;
          await markReminderEventSent(serviceClient, 'care_routine_events', event.id, res.messageId, leaseToken);
        } else {
          errorCount++;
          await releaseReminderEventClaim(serviceClient, 'care_routine_events', event.id, leaseToken);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      sentCount,
      errorCount,
    });
  } catch (err: any) {
    console.error("[WhatsApp Scheduler Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
