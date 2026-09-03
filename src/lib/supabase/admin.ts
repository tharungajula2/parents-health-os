import { createClient } from '@supabase/supabase-js'
import { Database } from './types'
import { assertNotForbiddenProject, assertServerOnly } from './safety'

export function createAdminClient() {
  assertServerOnly('supabase/admin')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    return null as any
  }

  assertNotForbiddenProject(url)

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
