-- ============================================================
-- Parents Health OS — Real V1 Database Schema Migration
-- Migration Name: 20260903120000_create_v1_schema.sql
-- Description: Canonical 15-Table Relational Schema
--              - Strict FK Creation Dependency Order
--              - Profiles, Families, Members, Care Recipients, Consents
--              - Health Documents & Untrusted AI Extractions (Server-Created)
--              - Health Conditions, Longitudinal Observations (Nullable Actor for WhatsApp)
--              - Care Routines, Routine Schedules & Routine Events
--              - Medications, Medication Schedules & Medication Events
--              - Private Schema Helpers (SET search_path = '')
--              - Role-Aware RLS (owner/caregiver/viewer) & Minimal Grants
-- ============================================================

-- CREATE PRIVATE AUTHORIZATION & TRIGGER SCHEMA
CREATE SCHEMA IF NOT EXISTS private;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(trim(full_name)) > 0),
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. FAMILIES TABLE
CREATE TABLE IF NOT EXISTS public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. FAMILY_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'caregiver' CHECK (role IN ('owner', 'caregiver', 'viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT family_members_family_user_unique UNIQUE (family_id, user_id)
);

-- 4. CARE_RECIPIENTS TABLE
CREATE TABLE IF NOT EXISTS public.care_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(trim(display_name)) > 0),
  relationship text NOT NULL CHECK (char_length(trim(relationship)) > 0),
  date_of_birth date,
  primary_language text NOT NULL DEFAULT 'English',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. CONSENTS TABLE (Append-Only Audit History)
CREATE TABLE IF NOT EXISTS public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id uuid NOT NULL REFERENCES public.care_recipients(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (char_length(trim(consent_type)) > 0),
  status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'revoked', 'pending')),
  notes text,
  recorded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. HEALTH_DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.health_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id uuid NOT NULL REFERENCES public.care_recipients(id) ON DELETE CASCADE,
  storage_path text NOT NULL CHECK (char_length(trim(storage_path)) > 0),
  document_type text NOT NULL CHECK (document_type IN ('lab_report', 'prescription', 'discharge_summary', 'other')),
  filename text NOT NULL CHECK (char_length(trim(filename)) > 0),
  mime_type text NOT NULL CHECK (char_length(trim(mime_type)) > 0),
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. DOCUMENT_EXTRACTIONS TABLE (Untrusted AI Extractions - Server Created)
CREATE TABLE IF NOT EXISTS public.document_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  health_document_id uuid NOT NULL REFERENCES public.health_documents(id) ON DELETE CASCADE,
  ai_provider text NOT NULL DEFAULT 'google-gemini',
  model_version text NOT NULL CHECK (char_length(trim(model_version)) > 0),
  extracted_data jsonb NOT NULL,
  extracted_at timestamptz NOT NULL DEFAULT now(),
  review_status text NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_extractions_review_check CHECK (
    (review_status = 'pending_review' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
    (review_status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  )
);

-- 8. HEALTH_CONDITIONS TABLE (Confirmed Diagnosis Lineage)
CREATE TABLE IF NOT EXISTS public.health_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id uuid NOT NULL REFERENCES public.care_recipients(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'managed', 'archived')),
  notes text,
  provenance text NOT NULL DEFAULT 'manual_entry' CHECK (provenance IN ('manual_entry', 'ai_extracted', 'doctor_diagnosed')),
  source_extraction_id uuid REFERENCES public.document_extractions(id) ON DELETE RESTRICT,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT health_conditions_provenance_check CHECK (
    (provenance = 'ai_extracted' AND source_extraction_id IS NOT NULL AND verified_by IS NOT NULL AND verified_at IS NOT NULL) OR
    (provenance != 'ai_extracted' AND source_extraction_id IS NULL)
  ),
  CONSTRAINT health_conditions_verification_check CHECK (
    (verified_by IS NULL AND verified_at IS NULL) OR
    (verified_by IS NOT NULL AND verified_at IS NOT NULL)
  )
);

-- 9. HEALTH_OBSERVATIONS TABLE (Longitudinal Vitals & Symptom Logs - Nullable Actor for Server/WhatsApp)
CREATE TABLE IF NOT EXISTS public.health_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id uuid NOT NULL REFERENCES public.care_recipients(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('blood_pressure', 'blood_glucose', 'weight', 'body_temperature', 'pulse_oximetry', 'heart_rate', 'symptom_notes', 'other')),
  observed_at timestamptz NOT NULL DEFAULT now(),
  value_numeric numeric,
  value_sys numeric,
  value_dia numeric,
  value_text text,
  unit text,
  source text NOT NULL DEFAULT 'caregiver' CHECK (source IN ('app', 'whatsapp', 'caregiver', 'document', 'device')),
  source_document_id uuid REFERENCES public.health_documents(id) ON DELETE SET NULL,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT health_observations_bp_check CHECK (
    (category = 'blood_pressure' AND value_sys IS NOT NULL AND value_dia IS NOT NULL) OR
    (category != 'blood_pressure' AND value_sys IS NULL AND value_dia IS NULL)
  )
);

-- 10. CARE_ROUTINES TABLE (Non-Medication Care Activities)
CREATE TABLE IF NOT EXISTS public.care_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id uuid NOT NULL REFERENCES public.care_recipients(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  description text,
  category text NOT NULL CHECK (category IN ('exercise', 'physiotherapy', 'hydration', 'dietary', 'respiratory', 'sleep', 'hygiene', 'other')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. CARE_ROUTINE_SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.care_routine_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES public.care_routines(id) ON DELETE RESTRICT,
  local_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  applicable_days text[] NOT NULL DEFAULT '{"monday","tuesday","wednesday","thursday","friday","saturday","sunday"}',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT care_routine_schedules_date_check CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT care_routine_schedules_applicable_days_check CHECK (
    cardinality(applicable_days) > 0 AND
    applicable_days <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  )
);

-- 12. CARE_ROUTINE_EVENTS TABLE (Idempotent Routine Adherence Events)
CREATE TABLE IF NOT EXISTS public.care_routine_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.care_routine_schedules(id) ON DELETE RESTRICT,
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'partial', 'skipped', 'missed', 'snoozed')),
  responded_at timestamptz,
  response_source text CHECK (response_source IN ('app', 'whatsapp', 'caregiver')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT care_routine_events_schedule_due_unique UNIQUE (schedule_id, due_at)
);

-- 13. MEDICATIONS TABLE (Human Verified Truth + Strict AI Lineage)
CREATE TABLE IF NOT EXISTS public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id uuid NOT NULL REFERENCES public.care_recipients(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  dosage text NOT NULL CHECK (char_length(trim(dosage)) > 0),
  instructions text,
  is_active boolean NOT NULL DEFAULT true,
  provenance text NOT NULL DEFAULT 'manual_entry' CHECK (provenance IN ('manual_entry', 'ai_extracted', 'doctor_prescribed')),
  source_extraction_id uuid REFERENCES public.document_extractions(id) ON DELETE RESTRICT,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT medications_provenance_check CHECK (
    (provenance = 'ai_extracted' AND source_extraction_id IS NOT NULL AND verified_by IS NOT NULL AND verified_at IS NOT NULL) OR
    (provenance != 'ai_extracted' AND source_extraction_id IS NULL)
  ),
  CONSTRAINT medications_verification_check CHECK (
    (verified_by IS NULL AND verified_at IS NULL) OR
    (verified_by IS NOT NULL AND verified_at IS NOT NULL)
  )
);

-- 14. MEDICATION_SCHEDULES TABLE (Restricted FK to preserve history)
CREATE TABLE IF NOT EXISTS public.medication_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
  local_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  applicable_days text[] NOT NULL DEFAULT '{"monday","tuesday","wednesday","thursday","friday","saturday","sunday"}',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT medication_schedules_date_check CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT medication_schedules_applicable_days_check CHECK (
    cardinality(applicable_days) > 0 AND
    applicable_days <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  )
);

-- 15. MEDICATION_EVENTS TABLE (Idempotent Adherence Events via Schedule)
CREATE TABLE IF NOT EXISTS public.medication_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.medication_schedules(id) ON DELETE RESTRICT,
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'skipped', 'missed', 'snoozed')),
  responded_at timestamptz,
  response_source text CHECK (response_source IN ('app', 'whatsapp', 'caregiver')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT medication_events_schedule_due_unique UNIQUE (schedule_id, due_at)
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_care_recipients_family_id ON public.care_recipients(family_id);
CREATE INDEX IF NOT EXISTS idx_consents_care_recipient_id ON public.consents(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_care_recipient_id ON public.health_documents(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_document_extractions_health_document_id ON public.document_extractions(health_document_id);
CREATE INDEX IF NOT EXISTS idx_health_conditions_care_recipient_id ON public.health_conditions(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_health_conditions_source_extraction_id ON public.health_conditions(source_extraction_id);
CREATE INDEX IF NOT EXISTS idx_health_observations_care_recipient_observed ON public.health_observations(care_recipient_id, observed_at);
CREATE INDEX IF NOT EXISTS idx_care_routines_care_recipient_id ON public.care_routines(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_care_routine_schedules_routine_id ON public.care_routine_schedules(routine_id);
CREATE INDEX IF NOT EXISTS idx_care_routine_events_schedule_due ON public.care_routine_events(schedule_id, due_at);
CREATE INDEX IF NOT EXISTS idx_medications_care_recipient_id ON public.medications(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_medications_source_extraction_id ON public.medications(source_extraction_id);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_medication_id ON public.medication_schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_events_schedule_due ON public.medication_events(schedule_id, due_at);

-- PRIVATE AUTHORIZATION SECURITY DEFINER FUNCTIONS

CREATE OR REPLACE FUNCTION private.is_family_member(check_family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE family_id = check_family_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION private.has_family_role(check_family_id uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE family_id = check_family_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND role = ANY(allowed_roles)
  );
$$;

-- REVOKE PUBLIC EXECUTE & GRANT SPECIFIC AUTHENTICATED ACCESS
REVOKE ALL ON FUNCTION private.is_family_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_family_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_family_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_family_role(uuid, text[]) TO authenticated;

-- PRIVATE AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- APPLY UPDATED_AT TRIGGERS TO ALL MUTABLE TABLES
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_care_recipients_updated_at BEFORE UPDATE ON public.care_recipients FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_health_conditions_updated_at BEFORE UPDATE ON public.health_conditions FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_health_observations_updated_at BEFORE UPDATE ON public.health_observations FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_care_routines_updated_at BEFORE UPDATE ON public.care_routines FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_care_routine_schedules_updated_at BEFORE UPDATE ON public.care_routine_schedules FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_care_routine_events_updated_at BEFORE UPDATE ON public.care_routine_events FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_document_extractions_updated_at BEFORE UPDATE ON public.document_extractions FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_medication_schedules_updated_at BEFORE UPDATE ON public.medication_schedules FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER tr_medication_events_updated_at BEFORE UPDATE ON public.medication_events FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- PRIVATE AI EXTRACTION IMMUTABILITY ENFORCEMENT TRIGGER
CREATE OR REPLACE FUNCTION private.enforce_extraction_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF OLD.health_document_id IS DISTINCT FROM NEW.health_document_id OR
     OLD.ai_provider IS DISTINCT FROM NEW.ai_provider OR
     OLD.model_version IS DISTINCT FROM NEW.model_version OR
     OLD.extracted_data IS DISTINCT FROM NEW.extracted_data OR
     OLD.extracted_at IS DISTINCT FROM NEW.extracted_at OR
     OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'Core AI extraction metadata is immutable once inserted.';
  END IF;

  IF OLD.review_status != 'pending_review' THEN
    RAISE EXCEPTION 'Completed document extractions (approved or rejected) cannot be modified.';
  END IF;

  IF NEW.review_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Review status transition must be from pending_review to approved or rejected.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_document_extractions_immutability BEFORE UPDATE ON public.document_extractions FOR EACH ROW EXECUTE FUNCTION private.enforce_extraction_immutability();

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_routine_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_routine_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_events ENABLE ROW LEVEL SECURITY;

-- ROLE-AWARE RLS POLICIES

-- PROFILES
CREATE POLICY "Users can view family co-members profiles" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.family_members fm1
      JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid() AND fm2.user_id = public.profiles.id AND fm1.status = 'active'
    )
  );

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- FAMILIES (Includes Creator Access for Initial Bootstrap)
CREATE POLICY "Family members or creator can view their family" ON public.families
  FOR SELECT USING (created_by = auth.uid() OR private.is_family_member(id));

CREATE POLICY "Authenticated users can create a family" ON public.families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family owners can update their family" ON public.families
  FOR UPDATE USING (private.has_family_role(id, ARRAY['owner']));

-- FAMILY_MEMBERS (Allows Bootstrap First Owner Membership)
CREATE POLICY "Family members can view co-members" ON public.family_members
  FOR SELECT USING (private.is_family_member(family_id));

CREATE POLICY "User can insert initial owner membership or owner can invite" ON public.family_members
  FOR INSERT WITH CHECK (
    (user_id = auth.uid() AND role = 'owner' AND EXISTS (
      SELECT 1 FROM public.families f WHERE f.id = family_id AND f.created_by = auth.uid()
    ))
    OR private.has_family_role(family_id, ARRAY['owner'])
  );

CREATE POLICY "Family owners can update members" ON public.family_members
  FOR UPDATE USING (private.has_family_role(family_id, ARRAY['owner']));

CREATE POLICY "Family owners can remove members" ON public.family_members
  FOR DELETE USING (private.has_family_role(family_id, ARRAY['owner']));

-- CARE_RECIPIENTS
CREATE POLICY "Family members can view care recipients" ON public.care_recipients
  FOR SELECT USING (private.is_family_member(family_id));

CREATE POLICY "Owners and caregivers can insert care recipients" ON public.care_recipients
  FOR INSERT WITH CHECK (private.has_family_role(family_id, ARRAY['owner', 'caregiver']));

CREATE POLICY "Owners and caregivers can update care recipients" ON public.care_recipients
  FOR UPDATE USING (private.has_family_role(family_id, ARRAY['owner', 'caregiver']));

-- CONSENTS (IMMUTABLE AUDIT LOG — ACTOR IDENTITY ENFORCED)
CREATE POLICY "Family members can view consents" ON public.consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.consents.care_recipient_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert consent records" ON public.consents
  FOR INSERT WITH CHECK (
    recorded_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.consents.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- HEALTH_DOCUMENTS (ACTOR IDENTITY ENFORCED)
CREATE POLICY "Family members can view health documents" ON public.health_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_documents.care_recipient_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can upload health documents" ON public.health_documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_documents.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- DOCUMENT_EXTRACTIONS (SERVER CREATED, HUMAN REVIEWABLE ONLY)
CREATE POLICY "Family members can view document extractions" ON public.document_extractions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.health_documents hd
      JOIN public.care_recipients cr ON cr.id = hd.care_recipient_id
      WHERE hd.id = public.document_extractions.health_document_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can review extractions" ON public.document_extractions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.health_documents hd
      JOIN public.care_recipients cr ON cr.id = hd.care_recipient_id
      WHERE hd.id = public.document_extractions.health_document_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  )
  WITH CHECK (
    reviewed_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.health_documents hd
      JOIN public.care_recipients cr ON cr.id = hd.care_recipient_id
      WHERE hd.id = public.document_extractions.health_document_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- HEALTH_CONDITIONS (CLIENT INSERT RESTRICTED TO NON-AI PROVENANCE)
CREATE POLICY "Family members can view health conditions" ON public.health_conditions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_conditions.care_recipient_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert non-AI health conditions" ON public.health_conditions
  FOR INSERT WITH CHECK (
    provenance IN ('manual_entry', 'doctor_diagnosed') AND
    source_extraction_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_conditions.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update health conditions" ON public.health_conditions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_conditions.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- HEALTH_OBSERVATIONS (CLIENT INSERT REQUIRES RECORDED_BY = AUTH.UID())
CREATE POLICY "Family members can view health observations" ON public.health_observations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_observations.care_recipient_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert health observations" ON public.health_observations
  FOR INSERT WITH CHECK (
    recorded_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_observations.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update health observations" ON public.health_observations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.health_observations.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- CARE_ROUTINES
CREATE POLICY "Family members can view care routines" ON public.care_routines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.care_routines.care_recipient_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert care routines" ON public.care_routines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.care_routines.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update care routines" ON public.care_routines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.care_routines.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- CARE_ROUTINE_SCHEDULES
CREATE POLICY "Family members can view care routine schedules" ON public.care_routine_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_routines r
      JOIN public.care_recipients cr ON cr.id = r.care_recipient_id
      WHERE r.id = public.care_routine_schedules.routine_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert care routine schedules" ON public.care_routine_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.care_routines r
      JOIN public.care_recipients cr ON cr.id = r.care_recipient_id
      WHERE r.id = public.care_routine_schedules.routine_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update care routine schedules" ON public.care_routine_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.care_routines r
      JOIN public.care_recipients cr ON cr.id = r.care_recipient_id
      WHERE r.id = public.care_routine_schedules.routine_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- CARE_ROUTINE_EVENTS
CREATE POLICY "Family members can view care routine events" ON public.care_routine_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_routine_schedules rs
      JOIN public.care_routines r ON r.id = rs.routine_id
      JOIN public.care_recipients cr ON cr.id = r.care_recipient_id
      WHERE rs.id = public.care_routine_events.schedule_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert care routine events" ON public.care_routine_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.care_routine_schedules rs
      JOIN public.care_routines r ON r.id = rs.routine_id
      JOIN public.care_recipients cr ON cr.id = r.care_recipient_id
      WHERE rs.id = public.care_routine_events.schedule_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update care routine events" ON public.care_routine_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.care_routine_schedules rs
      JOIN public.care_routines r ON r.id = rs.routine_id
      JOIN public.care_recipients cr ON cr.id = r.care_recipient_id
      WHERE rs.id = public.care_routine_events.schedule_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- MEDICATIONS (CLIENT INSERT RESTRICTED TO NON-AI PROVENANCE)
CREATE POLICY "Family members can view medications" ON public.medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.medications.care_recipient_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert non-AI medications" ON public.medications
  FOR INSERT WITH CHECK (
    provenance IN ('manual_entry', 'doctor_prescribed') AND
    source_extraction_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.medications.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update medications" ON public.medications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.care_recipients cr
      WHERE cr.id = public.medications.care_recipient_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- MEDICATION_SCHEDULES
CREATE POLICY "Family members can view schedules" ON public.medication_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.medications m
      JOIN public.care_recipients cr ON cr.id = m.care_recipient_id
      WHERE m.id = public.medication_schedules.medication_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert schedules" ON public.medication_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.medications m
      JOIN public.care_recipients cr ON cr.id = m.care_recipient_id
      WHERE m.id = public.medication_schedules.medication_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update schedules" ON public.medication_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.medications m
      JOIN public.care_recipients cr ON cr.id = m.care_recipient_id
      WHERE m.id = public.medication_schedules.medication_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- MEDICATION_EVENTS
CREATE POLICY "Family members can view medication events" ON public.medication_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.medication_schedules ms
      JOIN public.medications m ON m.id = ms.medication_id
      JOIN public.care_recipients cr ON cr.id = m.care_recipient_id
      WHERE ms.id = public.medication_events.schedule_id AND private.is_family_member(cr.family_id)
    )
  );

CREATE POLICY "Owners and caregivers can insert medication events" ON public.medication_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.medication_schedules ms
      JOIN public.medications m ON m.id = ms.medication_id
      JOIN public.care_recipients cr ON cr.id = m.care_recipient_id
      WHERE ms.id = public.medication_events.schedule_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

CREATE POLICY "Owners and caregivers can update medication events" ON public.medication_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.medication_schedules ms
      JOIN public.medications m ON m.id = ms.medication_id
      JOIN public.care_recipients cr ON cr.id = m.care_recipient_id
      WHERE ms.id = public.medication_events.schedule_id AND private.has_family_role(cr.family_id, ARRAY['owner', 'caregiver'])
    )
  );

-- EXPLICIT GRANTS FOR AUTHENTICATED USERS
REVOKE ALL ON SCHEMA public FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.families TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.care_recipients TO authenticated;
GRANT SELECT, INSERT ON public.consents TO authenticated; -- Append-only
GRANT SELECT, INSERT ON public.health_conditions TO authenticated;
GRANT UPDATE (name, status, notes, verified_by, verified_at, updated_at) ON public.health_conditions TO authenticated;
GRANT SELECT, INSERT ON public.health_observations TO authenticated;
GRANT UPDATE (notes, updated_at) ON public.health_observations TO authenticated;
GRANT SELECT, INSERT ON public.care_routines TO authenticated;
GRANT UPDATE (name, description, category, is_active, updated_at) ON public.care_routines TO authenticated;
GRANT SELECT, INSERT ON public.care_routine_schedules TO authenticated;
GRANT UPDATE (local_time, timezone, applicable_days, start_date, end_date, is_active, updated_at) ON public.care_routine_schedules TO authenticated;
GRANT SELECT, INSERT ON public.care_routine_events TO authenticated;
GRANT UPDATE (status, responded_at, response_source, notes, updated_at) ON public.care_routine_events TO authenticated;
GRANT SELECT, INSERT ON public.medications TO authenticated;
GRANT UPDATE (name, dosage, instructions, is_active, verified_by, verified_at, updated_at) ON public.medications TO authenticated;
GRANT SELECT, INSERT ON public.medication_schedules TO authenticated;
GRANT UPDATE (local_time, timezone, applicable_days, start_date, end_date, is_active, updated_at) ON public.medication_schedules TO authenticated;
GRANT SELECT, INSERT ON public.medication_events TO authenticated;
GRANT UPDATE (status, responded_at, response_source, notes, updated_at) ON public.medication_events TO authenticated;
GRANT SELECT, INSERT ON public.health_documents TO authenticated;
GRANT SELECT ON public.document_extractions TO authenticated; -- Server-side creation only
GRANT UPDATE (review_status, reviewed_by, reviewed_at, review_notes, updated_at) ON public.document_extractions TO authenticated;

-- AUTH USER TRIGGER FOR AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Caregiver'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user();
