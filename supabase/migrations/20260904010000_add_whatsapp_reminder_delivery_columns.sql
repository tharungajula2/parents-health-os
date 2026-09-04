-- ============================================================
-- Migration Name: 20260904010000_add_whatsapp_reminder_delivery_columns.sql
-- Description: Additive migration for WhatsApp reminder delivery tracking & idempotency.
--              Does NOT mutate historical event identity (schedule_id, due_at, created_at).
-- ============================================================

-- 1. ADD DELIVERY COLUMNS TO MEDICATION_EVENTS
ALTER TABLE public.medication_events
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_message_id text,
  ADD COLUMN IF NOT EXISTS reminder_delivery_status text CHECK (
    reminder_delivery_status IS NULL OR
    reminder_delivery_status IN ('pending', 'sent', 'delivered', 'read', 'failed')
  );

-- 2. ADD DELIVERY COLUMNS TO CARE_ROUTINE_EVENTS
ALTER TABLE public.care_routine_events
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_message_id text,
  ADD COLUMN IF NOT EXISTS reminder_delivery_status text CHECK (
    reminder_delivery_status IS NULL OR
    reminder_delivery_status IN ('pending', 'sent', 'delivered', 'read', 'failed')
  );

-- 3. CREATE PERFORMANCE INDEXES FOR SCHEDULER QUERYING
CREATE INDEX IF NOT EXISTS idx_medication_events_whatsapp_pending
  ON public.medication_events (status, reminder_sent_at, due_at)
  WHERE status = 'pending' AND reminder_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_care_routine_events_whatsapp_pending
  ON public.care_routine_events (status, reminder_sent_at, due_at)
  WHERE status = 'pending' AND reminder_sent_at IS NULL;
