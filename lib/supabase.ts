import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { mockAgents, mockCategories, getSimilarAgents, getPopularAgents, searchAgents } from './mock-data'

// 检查是否使用虚拟数据
export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

// 服务端使用（API 路由、Server Components）
export const supabaseAdmin = USE_MOCK_DATA ? null : (() => {
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  } catch (error) {
    console.warn('Supabase客户端创建失败，将使用null:', error)
    return null
  }
})()

// 客户端使用（Client Components）
export const createSupabaseClient = () => {
  if (USE_MOCK_DATA) {
    // 返回模拟的客户端
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({
              limit: async () => ({ data: [], error: null })
            })
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null })
          })
        })
      })
    } as any
  }
  return createClientComponentClient()
}

// 模拟数据库查询函数
export const mockSupabase = {
  // 获取单个Agent
  async getAgentBySlug(slug: string) {
    return mockAgents.find(agent => agent.slug === slug) || null
  },
  
  // 获取相似Agents
  async getSimilarAgents(currentAgentId: string, limit: number = 3) {
    return getSimilarAgents(currentAgentId, limit)
  },
  
  // 获取热门Agents
  async getPopularAgents(limit: number = 10) {
    return getPopularAgents(limit)
  },
  
  // 搜索Agents
  async searchAgents(query: string) {
    return searchAgents(query)
  },
  
  // 获取所有Agents
  async getAllAgents() {
    return mockAgents
  },
  
  // 获取分类
  async getCategories() {
    return mockCategories
  },
  
  // 更新浏览量
  async incrementViewCount(agentId: string) {
    const agent = mockAgents.find(a => a.id === agentId)
    if (agent) {
      agent.view_count = (agent.view_count || 0) + 1
    }
    return agent
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
