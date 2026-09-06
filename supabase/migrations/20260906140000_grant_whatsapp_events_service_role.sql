-- ============================================================
-- Migration Name: 20260906140000_grant_whatsapp_events_service_role.sql
-- Description: Grant least-privilege SELECT, UPDATE on event tables
--              and SELECT on schedule lookup tables to service_role
--              for server-side WhatsApp webhook & delivery updates.
-- ============================================================

-- 1. GRANT SELECT, UPDATE ON EVENT TABLES TO SERVICE_ROLE
GRANT SELECT, UPDATE
ON public.medication_events, public.care_routine_events
TO service_role;

-- 2. GRANT SELECT ON SCHEDULE LOOKUP TABLES TO SERVICE_ROLE
GRANT SELECT
ON public.medications, public.medication_schedules, public.care_routines, public.care_routine_schedules
TO service_role;
