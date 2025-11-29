import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 服务端使用（API 路由、Server Components）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 客户端使用（Client Components）
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// 数据库类型定义
export type Agent = {
  id: string
  slug: string
  name: string
  category_id: string
  short_description: string
  detailed_description: string | null
  key_features: string[]
  use_cases: string[]
  pros: string[]
  cons: string[]
  how_to_use: string | null
  platform: string | null
  pricing: string | null
  official_url: string | null
  keywords: string[]
  search_terms: string[]
  view_count: number
  favorite_count: number
  source: string | null
  source_id: string | null
  last_crawled_at: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  created_at: string
}

export type Comparison = {
  id: string
  slug: string
  agent_ids: string[]
  title: string
  content: string
  view_count: number
  created_at: string
  updated_at: string
}
