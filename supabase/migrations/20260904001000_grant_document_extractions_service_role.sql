-- Migration: Grant SELECT, INSERT on document_extractions to service_role
-- 1. SELECT is required for server-side Gemini duplicate/idempotency checks in /api/analyze
-- 2. INSERT is required for trusted server-side extraction creation via admin client in /api/analyze
-- 3. Authenticated browser users remain strictly forbidden from direct INSERT on document_extractions

GRANT SELECT, INSERT
ON public.document_extractions
TO service_role;
