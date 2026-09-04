import { assertServerOnly } from '../supabase/safety';

/**
 * Valid delivery status values from Meta WhatsApp Cloud API status webhooks.
 */
export type WhatsAppDeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Returns the PostgREST filter string for guarded conditional updates.
 * Ensures the database update itself enforces valid state transitions atomically,
 * preventing race conditions when concurrent webhooks execute in parallel.
 *
 * Transition Matrix:
 * - incoming 'sent': allowed from NULL or 'pending'
 * - incoming 'delivered': allowed from NULL, 'pending', 'sent', or 'failed' (NEVER 'read')
 * - incoming 'read': allowed from NULL, 'pending', 'sent', 'delivered', or 'failed'
 * - incoming 'failed': allowed from NULL, 'pending', or 'sent' (NEVER 'delivered' or 'read')
 */
export function getGuardedStatusUpdateFilter(incomingStatus: WhatsAppDeliveryStatus): string | null {
  switch (incomingStatus) {
    case 'sent':
      return 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending';
    case 'delivered':
      return 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending,reminder_delivery_status.eq.sent,reminder_delivery_status.eq.failed';
    case 'read':
      return 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending,reminder_delivery_status.eq.sent,reminder_delivery_status.eq.delivered,reminder_delivery_status.eq.failed';
    case 'failed':
      return 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending,reminder_delivery_status.eq.sent';
    default:
      return null;
  }
}

/**
 * Pure transition logic helper for preliminary evaluation and unit testing.
 *
 * Rules for out-of-order / retried webhook events:
 * 1. Progressive update (e.g. sent -> delivered -> read) is allowed.
 * 2. Status downgrades (e.g. read -> delivered, read -> sent, delivered -> sent) are strictly prohibited.
 * 3. Duplicate status receipts (e.g. delivered -> delivered, read -> read) are harmless no-ops.
 * 4. Failed status rule:
 *    - If current status is pending or sent, transition to failed is allowed.
 *    - If current status has already reached delivered or read, a late/retried failed receipt MUST NOT overwrite delivered/read.
 *    - If current status is failed, delivered/read receipts override failed (since delivery was successful).
 */
export function shouldUpdateDeliveryStatus(
  currentStatus: string | null | undefined,
  incomingStatus: string
): { shouldUpdate: boolean; nextStatus?: WhatsAppDeliveryStatus; reason?: string } {
  const normalizedIncoming = incomingStatus.toLowerCase().trim() as WhatsAppDeliveryStatus;

  const validStatuses: WhatsAppDeliveryStatus[] = ['sent', 'delivered', 'read', 'failed'];
  if (!validStatuses.includes(normalizedIncoming)) {
    return { shouldUpdate: false, reason: `Invalid delivery status value: ${incomingStatus}` };
  }

  const normalizedCurrent = (currentStatus || 'pending').toLowerCase().trim();

  // 1. Current is read: highest terminal delivery state
  if (normalizedCurrent === 'read') {
    return {
      shouldUpdate: false,
      reason: `Current delivery status is already 'read'; incoming '${normalizedIncoming}' cannot downgrade state.`,
    };
  }

  // 2. Current is delivered: can advance to read only
  if (normalizedCurrent === 'delivered') {
    if (normalizedIncoming === 'read') {
      return { shouldUpdate: true, nextStatus: 'read' };
    }
    return {
      shouldUpdate: false,
      reason: `Current delivery status is 'delivered'; incoming '${normalizedIncoming}' cannot downgrade or duplicate state.`,
    };
  }

  // 3. Current is failed: incoming delivered or read proves successful delivery
  if (normalizedCurrent === 'failed') {
    if (normalizedIncoming === 'delivered' || normalizedIncoming === 'read') {
      return { shouldUpdate: true, nextStatus: normalizedIncoming };
    }
    return {
      shouldUpdate: false,
      reason: `Current delivery status is 'failed'; incoming '${normalizedIncoming}' ignored.`,
    };
  }

  // 4. Current is sent: can advance to delivered, read, or failed; duplicate sent ignored
  if (normalizedCurrent === 'sent') {
    if (normalizedIncoming === 'sent') {
      return { shouldUpdate: false, reason: "Duplicate 'sent' status received." };
    }
    return { shouldUpdate: true, nextStatus: normalizedIncoming };
  }

  // 5. Current is pending / null / unset: any valid status advances state
  return { shouldUpdate: true, nextStatus: normalizedIncoming };
}

/**
 * Persists Meta WhatsApp delivery status update to database using service-role client.
 * Searches medication_events first, then care_routine_events by matching reminder_message_id = statusId.
 * Executes guarded atomic updates via getGuardedStatusUpdateFilter to prevent concurrent race conditions.
 */
export async function handleWhatsAppDeliveryStatusUpdate(
  serviceClient: any,
  statusId: string,
  incomingStatus: string
): Promise<{
  success: boolean;
  eventType?: 'medication_event' | 'care_routine_event';
  eventId?: string;
  statusUpdated?: boolean;
  nextStatus?: string;
  reason?: string;
}> {
  assertServerOnly('whatsapp/status');

  if (!serviceClient) {
    return { success: false, reason: "Service-role client unavailable" };
  }

  // 1. Search medication_events for matching reminder_message_id
  const { data: medEvent, error: medFetchErr } = await serviceClient
    .from("medication_events")
    .select("id, reminder_delivery_status")
    .eq("reminder_message_id", statusId)
    .maybeSingle();

  if (medFetchErr) {
    console.error(`[WhatsApp Status] Error searching medication_events for messageId ${statusId}:`, medFetchErr.message);
  }

  if (medEvent) {
    const check = shouldUpdateDeliveryStatus(medEvent.reminder_delivery_status, incomingStatus);
    if (!check.shouldUpdate || !check.nextStatus) {
      console.log(`[WhatsApp Status] Ignored status update for medication_event ${medEvent.id}: ${check.reason}`);
      return { success: true, eventType: 'medication_event', eventId: medEvent.id, statusUpdated: false, reason: check.reason };
    }

    const filterString = getGuardedStatusUpdateFilter(check.nextStatus);
    if (!filterString) {
      return { success: false, reason: `Invalid nextStatus: ${check.nextStatus}` };
    }

    const nowIso = new Date().toISOString();
    // Guarded atomic update: filter condition is evaluated directly in DB query
    const { data: updatedRows, error: updateErr } = await serviceClient
      .from("medication_events")
      .update({
        reminder_delivery_status: check.nextStatus,
        updated_at: nowIso,
      })
      .eq("id", medEvent.id)
      .or(filterString)
      .select("id, reminder_delivery_status");

    if (updateErr) {
      console.error(`[WhatsApp Status] Error updating medication_event ${medEvent.id}:`, updateErr.message);
      return { success: false, eventType: 'medication_event', eventId: medEvent.id, reason: updateErr.message };
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.warn(`[WhatsApp Status] Atomic guard skipped update on medication_event ${medEvent.id} (concurrent state change to ${check.nextStatus} superseded or incompatible).`);
      return { success: true, eventType: 'medication_event', eventId: medEvent.id, statusUpdated: false, reason: "atomic_guard_skipped" };
    }

    console.log(`[WhatsApp Status] Updated medication_event ${medEvent.id} delivery status -> ${check.nextStatus}`);
    return { success: true, eventType: 'medication_event', eventId: medEvent.id, statusUpdated: true, nextStatus: check.nextStatus };
  }

  // 2. Search care_routine_events for matching reminder_message_id
  const { data: routineEvent, error: routineFetchErr } = await serviceClient
    .from("care_routine_events")
    .select("id, reminder_delivery_status")
    .eq("reminder_message_id", statusId)
    .maybeSingle();

  if (routineFetchErr) {
    console.error(`[WhatsApp Status] Error searching care_routine_events for messageId ${statusId}:`, routineFetchErr.message);
  }

  if (routineEvent) {
    const check = shouldUpdateDeliveryStatus(routineEvent.reminder_delivery_status, incomingStatus);
    if (!check.shouldUpdate || !check.nextStatus) {
      console.log(`[WhatsApp Status] Ignored status update for care_routine_event ${routineEvent.id}: ${check.reason}`);
      return { success: true, eventType: 'care_routine_event', eventId: routineEvent.id, statusUpdated: false, reason: check.reason };
    }

    const filterString = getGuardedStatusUpdateFilter(check.nextStatus);
    if (!filterString) {
      return { success: false, reason: `Invalid nextStatus: ${check.nextStatus}` };
    }

    const nowIso = new Date().toISOString();
    // Guarded atomic update: filter condition is evaluated directly in DB query
    const { data: updatedRows, error: updateErr } = await serviceClient
      .from("care_routine_events")
      .update({
        reminder_delivery_status: check.nextStatus,
        updated_at: nowIso,
      })
      .eq("id", routineEvent.id)
      .or(filterString)
      .select("id, reminder_delivery_status");

    if (updateErr) {
      console.error(`[WhatsApp Status] Error updating care_routine_event ${routineEvent.id}:`, updateErr.message);
      return { success: false, eventType: 'care_routine_event', eventId: routineEvent.id, reason: updateErr.message };
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.warn(`[WhatsApp Status] Atomic guard skipped update on care_routine_event ${routineEvent.id} (concurrent state change to ${check.nextStatus} superseded or incompatible).`);
      return { success: true, eventType: 'care_routine_event', eventId: routineEvent.id, statusUpdated: false, reason: "atomic_guard_skipped" };
    }

    console.log(`[WhatsApp Status] Updated care_routine_event ${routineEvent.id} delivery status -> ${check.nextStatus}`);
    return { success: true, eventType: 'care_routine_event', eventId: routineEvent.id, statusUpdated: true, nextStatus: check.nextStatus };
  }

  // 3. Unknown reminder_message_id: log minimal warning without secrets or PHI
  console.warn(`[WhatsApp Status] Received delivery status for unknown reminder_message_id: "${statusId}". Ignored without mutation.`);
  return { success: true, statusUpdated: false, reason: "unknown_message_id" };
}
