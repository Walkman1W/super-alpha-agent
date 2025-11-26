import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 服务端使用（API 路由、Server Components）
export const supabaseAdmin = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    // Mock implementation for development when environment variables are not set
    console.warn('Supabase environment variables not found. Using mock implementation.');
    return {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => ({})
          })
        }),
        insert: () => ({})
      })
    } as any;
  }
})()

// 客户端使用（Client Components）
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    return createClientComponentClient();
  } else {
    // Mock implementation for development when environment variables are not set
    console.warn('Supabase environment variables not found. Using mock implementation.');
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve(null),
            limit: () => Promise.resolve([])
          }),
          limit: () => Promise.resolve([]),
          order: () => ({
            limit: () => Promise.resolve([])
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({})
        })
      })
    } as any;
  }
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
