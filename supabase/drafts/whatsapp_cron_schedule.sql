-- DRAFT ONLY — DO NOT APPLY UNTIL WHATSAPP MANUAL LOOP PASSES
-- Requires Supabase Vault configuration before activation.

-- ============================================================
-- Migration Name: 20260904020000_setup_whatsapp_cron_schedule.sql
-- Description: Configures Supabase pg_cron + pg_net schedule to trigger
--              the protected POST /api/whatsapp/reminders/run endpoint
--              every 5 minutes using Supabase Vault for secret lookup.
--
-- DO NOT EXECUTE REMOTELY YET — Requires manual secret entry in Vault.
-- ============================================================

-- 1. ENSURE EXTENSIONS ARE AVAILABLE
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. CREATE HELPER FUNCTION TO TRIGGER WHATSAPP REMINDER SCHEDULER
-- Retrieves REMINDER_CRON_SECRET from Supabase Vault (vault.decrypted_secrets)
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_secret text;
  v_app_url text;
  v_request_id bigint;
BEGIN
  -- Retrieve secret securely from Supabase Vault
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'REMINDER_CRON_SECRET'
  LIMIT 1;

  IF v_secret IS NULL OR char_length(trim(v_secret)) = 0 THEN
    RAISE LOG '[WhatsApp Cron] REMINDER_CRON_SECRET not configured in Supabase Vault. Skipping run.';
    RETURN;
  END IF;

  -- Retrieve APP_URL or default to project edge function / production URL
  SELECT decrypted_secret INTO v_app_url
  FROM vault.decrypted_secrets
  WHERE name = 'APP_URL'
  LIMIT 1;

  IF v_app_url IS NULL OR char_length(trim(v_app_url)) = 0 THEN
    v_app_url := 'https://parents-health-os.vercel.app';
  END IF;

  -- Make asynchronous HTTP POST request using pg_net
  SELECT net.http_post(
    url := v_app_url || '/api/whatsapp/reminders/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  RAISE LOG '[WhatsApp Cron] Triggered reminders/run via pg_net request_id: %', v_request_id;
END;
$$;

-- 3. SCHEDULE CRON JOB EVERY 5 MINUTES
-- Unschedules previous instance if exists to prevent duplicates
SELECT cron.unschedule('whatsapp-care-reminders')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'whatsapp-care-reminders'
);

SELECT cron.schedule(
  'whatsapp-care-reminders',
  '*/5 * * * *',
  'SELECT public.trigger_whatsapp_reminders();'
);
