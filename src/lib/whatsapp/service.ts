import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { assertNotForbiddenProject, assertServerOnly } from '../supabase/safety';
import { sendMetaWhatsAppMessage, formatIndianPhoneNumber, maskPhoneNumber } from './client';
import { getWhatsAppConfig } from './config';

export function createServiceRoleClient() {
  assertServerOnly('whatsapp/service');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) return null;

  assertNotForbiddenProject(url);
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
  Dispatches a deterministic medication reminder for a specific medication_event.
  Payload format: med:<medication_event_uuid>:[taken|skipped|snoozed]
 */
export async function sendMedicationReminder(params: {
  eventId: string;
  medicationName: string;
  dosage: string;
  localTime: string;
  recipientName: string;
  recipientPhone: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  assertServerOnly('whatsapp/service');

  const formattedPhone = formatIndianPhoneNumber(params.recipientPhone);
  if (!formattedPhone) {
    return {
      success: false,
      error: `Care recipient ${params.recipientName} does not have a valid E.164 phone number configured.`,
    };
  }

  const dosageStr = params.dosage ? ` ${params.dosage}` : "";
  const bodyText = `Hi ${params.recipientName} 👋\nIt's time for ${params.medicationName}${dosageStr}.\nScheduled: ${params.localTime}\n\nPlease confirm below.`;

  const buttons = [
    { id: `med:${params.eventId}:taken`, title: "TAKEN" },
    { id: `med:${params.eventId}:skipped`, title: "SKIP" },
    { id: `med:${params.eventId}:snoozed`, title: "SNOOZE" },
  ];

  const config = getWhatsAppConfig();
  const templateName = config.medicationTemplate;

  return await sendMetaWhatsAppMessage({
    toPhone: formattedPhone,
    bodyText,
    buttons,
    templateName,
    templateParameters: [params.recipientName, `${params.medicationName}${dosageStr}`, params.localTime],
  });
}

/**
  Dispatches a deterministic care routine reminder for a specific care_routine_event.
  Payload format: routine:<care_routine_event_uuid>:[completed|skipped|snoozed]
 */
export async function sendCareRoutineReminder(params: {
  eventId: string;
  routineName: string;
  localTime: string;
  recipientName: string;
  recipientPhone: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  assertServerOnly('whatsapp/service');

  const formattedPhone = formatIndianPhoneNumber(params.recipientPhone);
  if (!formattedPhone) {
    return {
      success: false,
      error: `Care recipient ${params.recipientName} does not have a valid E.164 phone number configured.`,
    };
  }

  const bodyText = `Hi ${params.recipientName} 👋\n${params.routineName} is scheduled for ${params.localTime}.\n\nPlease confirm below.`;

  const buttons = [
    { id: `routine:${params.eventId}:completed`, title: "DONE" },
    { id: `routine:${params.eventId}:skipped`, title: "SKIP" },
    { id: `routine:${params.eventId}:snoozed`, title: "SNOOZE" },
  ];

  const config = getWhatsAppConfig();
  const templateName = config.routineTemplate;

  return await sendMetaWhatsAppMessage({
    toPhone: formattedPhone,
    bodyText,
    buttons,
    templateName,
    templateParameters: [params.recipientName, params.routineName, params.localTime],
  });
}

/**
 * Atomically attempts to claim an event for reminder dispatch before calling Meta API.
 * Claim succeeds only when:
 * 1. event status = 'pending'
 * 2. reminder_sent_at IS NULL
 * 3. reminder_delivery_status IS NULL OR (reminder_delivery_status = 'pending' AND updated_at <= staleThresholdIso)
 * Returns the persisted database updated_at timestamp as a Compare-And-Swap (CAS) leaseToken.
 */
export async function claimReminderEvent(
  serviceClient: any,
  tableName: 'medication_events' | 'care_routine_events',
  eventId: string,
  nowIso: string,
  staleThresholdIso: string
): Promise<{ success: boolean; leaseToken?: string }> {
  assertServerOnly('whatsapp/service');

  if (!serviceClient) return { success: false };

  const filterString = `reminder_delivery_status.is.null,and(reminder_delivery_status.eq.pending,updated_at.lte.${staleThresholdIso})`;

  const { data, error } = await serviceClient
    .from(tableName)
    .update({
      reminder_delivery_status: 'pending',
      updated_at: nowIso,
    })
    .eq('id', eventId)
    .eq('status', 'pending')
    .is('reminder_sent_at', null)
    .or(filterString)
    .select('id, updated_at');

  if (error) {
    console.error(`[WhatsApp Scheduler Claim] Error claiming ${tableName} event ${eventId}:`, error.message);
    return { success: false };
  }

  if (Array.isArray(data) && data.length > 0 && data[0].updated_at) {
    return { success: true, leaseToken: data[0].updated_at };
  }

  return { success: false };
}

/**
 * Releases an active claim on pre-acceptance Meta API dispatch failure, restoring
 * reminder_delivery_status to null so subsequent scheduler runs can retry delivery.
 * Requires exact leaseToken CAS match to prevent stale workers from mutating newer leases.
 */
export async function releaseReminderEventClaim(
  serviceClient: any,
  tableName: 'medication_events' | 'care_routine_events',
  eventId: string,
  leaseToken: string
): Promise<{ success: boolean; leaseLost?: boolean }> {
  assertServerOnly('whatsapp/service');

  if (!serviceClient || !leaseToken) return { success: false, leaseLost: true };

  const nowIso = new Date().toISOString();
  const { data, error } = await serviceClient
    .from(tableName)
    .update({
      reminder_delivery_status: null,
      updated_at: nowIso,
    })
    .eq('id', eventId)
    .eq('reminder_delivery_status', 'pending')
    .eq('updated_at', leaseToken)
    .is('reminder_sent_at', null)
    .select('id');

  if (error) {
    console.error(`[WhatsApp Scheduler Release] Error releasing claim on ${tableName} event ${eventId}:`, error.message);
    return { success: false };
  }

  if (!data || data.length === 0) {
    console.warn(`[WhatsApp Scheduler Release] Lease lost for ${tableName} event ${eventId} (leaseToken ${leaseToken} superseded). Release skipped.`);
    return { success: true, leaseLost: true };
  }

  return { success: true, leaseLost: false };
}

/**
 * Marks an event as successfully sent after receiving HTTP acceptance & messageId from Meta API.
 * Requires exact leaseToken CAS match to prevent stale workers from overwriting newer leases.
 */
export async function markReminderEventSent(
  serviceClient: any,
  tableName: 'medication_events' | 'care_routine_events',
  eventId: string,
  messageId: string,
  leaseToken: string
): Promise<{ success: boolean; leaseLost?: boolean }> {
  assertServerOnly('whatsapp/service');

  if (!serviceClient || !leaseToken) return { success: false, leaseLost: true };

  const nowIso = new Date().toISOString();
  const { data, error } = await serviceClient
    .from(tableName)
    .update({
      reminder_sent_at: nowIso,
      reminder_message_id: messageId,
      reminder_delivery_status: 'sent',
      updated_at: nowIso,
    })
    .eq('id', eventId)
    .eq('reminder_delivery_status', 'pending')
    .eq('updated_at', leaseToken)
    .is('reminder_sent_at', null)
    .select('id');

  if (error) {
    console.error(`[WhatsApp Scheduler Sent] Error marking ${tableName} event ${eventId} sent:`, error.message);
    return { success: false };
  }

  if (!data || data.length === 0) {
    console.warn(`[WhatsApp Scheduler Sent] Lease lost for ${tableName} event ${eventId} (leaseToken ${leaseToken} superseded by another worker). Sent state update skipped.`);
    return { success: true, leaseLost: true };
  }

  return { success: true, leaseLost: false };
}
