// ============================================================
// 🔒 PROJECT SAFETY & SECURITY GUARDS — DO NOT REMOVE
// Protected project: trelis-life (lhqtqofjrqoyscobsfud)
// This guard prevents Parents Health OS from accidentally
// connecting to the protected trelis-life Supabase project.
// See PROJECT_SAFETY_LOCK.md for full context.
// ============================================================
const FORBIDDEN_PROJECT_REF = 'lhqtqofjrqoyscobsfud';

/**
 * Ensures the configured Supabase URL does not point to the forbidden trelis-life project.
 */
export function assertNotForbiddenProject(url: string | undefined): void {
  if (!url) return;
  if (url.includes(FORBIDDEN_PROJECT_REF)) {
    const msg =
      '[Parents Health OS] SAFETY VIOLATION: The configured NEXT_PUBLIC_SUPABASE_URL ' +
      'points to the protected trelis-life project (ref: lhqtqofjrqoyscobsfud). ' +
      'This project must NEVER be used for Parents Health OS. ' +
      'Remove the trelis-life credentials from .env.local immediately. ' +
      'See PROJECT_SAFETY_LOCK.md for details.';
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg);
    } else {
      console.error(msg);
    }
  }
}

/**
 * Ensures server-only modules containing privileged secrets (SUPABASE_SECRET_KEY)
 * are never executed within browser/client execution contexts.
 */
export function assertServerOnly(moduleName: string): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      `[Parents Health OS] SECURITY VIOLATION: ${moduleName} was accessed from client-side execution context. ` +
      'Privileged Supabase secrets (SUPABASE_SECRET_KEY) must never be exposed to the browser.'
    );
  }
}
