import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'
import { assertNotForbiddenProject } from './safety'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    // Return null when environment variables are unconfigured
    return null as any
  }

  // Safety check: refuse to connect to trelis-life under any circumstance
  assertNotForbiddenProject(url)

  return createBrowserClient<Database>(url, key)
}
