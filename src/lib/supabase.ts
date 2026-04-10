import { createClient } from '@supabase/supabase-js'

// 服务端专用（使用 service_role key，绕过 RLS，只在 API routes 中使用）
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
