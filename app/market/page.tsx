'use client'

import { createSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, PlusCircle, TrendingUp, Star, Zap, Award } from 'lucide-react'

export default function AgentMarketPage() {
  // 状态管理
  const [viewMode, setViewMode] = useState<'market' | 'publish'>('market')
  const [agentTab, setAgentTab] = useState<'popular' | 'new'>('popular')
  const [popularAgents, setPopularAgents] = useState([])
  const [newAgents, setNewAgents] = useState([])
  const [totalAgents, setTotalAgents] = useState(0)
  const [totalAISearches, setTotalAISearches] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 客户端数据获取
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseClient()
        
        // 获取热门 Agents（按 AI 搜索量排序）
        const { data: popular } = await supabase
          .from('agents')
          .select('id, slug, name, short_description, platform, ai_search_count, view_count, official_url, created_at')
          .order('ai_search_count', { ascending: false })
          .limit(12)
        
        // 获取最新 Agents
        const { data: newAgentsData } = await supabase
          .from('agents')
          .select('id, slug, name, short_description, platform, ai_search_count, view_count, official_url, created_at')
          .order('created_at', { ascending: false })
          .limit(12)
        
        // 获取总统计数据
        const { count: total } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })
          
        const { data: aiSearches } = await supabase
          .from('agents')
          .select('ai_search_count')
        
        const totalAISearchCount = aiSearches?.reduce((total, agent) => total + (agent.ai_search_count || 0), 0) || 0

        // 模拟数据
        const mockAgents = [
          {
            id: '1',
            slug: 'chatgpt',
            name: 'ChatGPT',
            short_description: '强大的 AI 聊天机器人，能回答各种问题并帮助完成任务',
            platform: 'web',
            ai_search_count: 123456,
            view_count: 1234567,
            official_url: 'https://chat.openai.com/',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            slug: 'midjourney',
            name: 'Midjourney',
            short_description: 'AI 图像生成工具，根据文本提示创建高质量图像',
            platform: 'discord',
            ai_search_count: 98765,
            view_count: 987654,
            official_url: 'https://www.midjourney.com/',
            created_at: new Date().toISOString()
          }
        ]

        // 使用模拟数据作为 fallback
        setPopularAgents(popular?.length ? popular : mockAgents)
        setNewAgents(newAgentsData?.length ? newAgentsData : mockAgents)
        setTotalAgents(total || 150)
        setTotalAISearches(totalAISearchCount || 12543)
      } catch (err) {
        setError('Failed to fetch agents')
        console.error('Error fetching agents:', err)
        // 网络错误时使用模拟数据
        const mockAgents = [
          {
            id: '1',
            slug: 'chatgpt',
            name: 'ChatGPT',
            short_description: '强大的 AI 聊天机器人，能回答各种问题并帮助完成任务',
            platform: 'web',
            ai_search_count: 123456,
            view_count: 1234567,
            official_url: 'https://chat.openai.com/',
            created_at: new Date().toISOString()
          }
        ]
        setPopularAgents(mockAgents)
        setNewAgents(mockAgents)
        setTotalAgents(150)
        setTotalAISearches(12543)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [viewMode, agentTab])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">加载失败</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {/* 大气的英雄区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBsMSAxIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjZmZmIi8+PC9zdmc+')} opacity-10"></div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white">
              🚀 AI Agent 服务市场
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
              发现最强大的
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                AI 智能助手
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100 leading-relaxed">
              精选 <span className="font-bold text-white">{totalAgents || 0}+</span> 个 AI 智能助手，
              <br />
              累计 <span className="font-bold text-white">{totalAISearches || 0}+</span> 次 AI 引擎搜索发现
            </p>
            
            {/* 切换图标 */}
            <div className="flex justify-center gap-6 mb-8">
              <div 
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${viewMode === 'market' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => setViewMode('market')}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${viewMode === 'market' ? 'bg-white text-blue-600 shadow-xl' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                  <Search />
                </div>
                <span className="text-white font-medium">Agent 市场</span>
              </div>
              
              <div 
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${viewMode === 'publish' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => setViewMode('publish')}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${viewMode === 'publish' ? 'bg-white text-blue-600 shadow-xl' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                  <PlusCircle />
                </div>
                <span className="text-white font-medium">发布 Agent</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 波浪分隔 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)"/>
          </svg>
        </div>
      </section>
      
      {/* Agent 市场内容 */}
      {viewMode === 'market' && (
        <section className="container mx-auto px-4 py-16">
          {/* 顶部统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-4xl mb-3 text-blue-600">{totalAgents || 0}</div>
              <div className="text-lg font-semibold">总 AI Agents</div>
              <div className="text-sm text-gray-500 mt-1">收录各类 AI 智能助手</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-4xl mb-3 text-purple-600">{totalAISearches || 0}</div>
              <div className="text-lg font-semibold">AI 搜索发现</div>
              <div className="text-sm text-gray-500 mt-1">被 AI 引擎推荐次数</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-4xl mb-3 text-green-600">{popularAgents?.length || 0}</div>
              <div className="text-lg font-semibold">热门 Agents</div>
              <div className="text-sm text-gray-500 mt-1">最受 AI 引擎欢迎</div>
            </div>
          </div>
          
          {/* 标签切换 */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 rounded-full bg-gray-200">
              <button 
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${agentTab === 'popular' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setAgentTab('popular')}
              >
                <TrendingUp className="inline-block mr-2 h-4 w-4" />
                热门 Agents
              </button>
              <button 
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${agentTab === 'new' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setAgentTab('new')}
              >
                <Star className="inline-block mr-2 h-4 w-4" />
                最新 Agents
              </button>
            </div>
          </div>
          
          {/* Agent 卡片展示 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(agentTab === 'popular' ? popularAgents : newAgents)?.map((agent) => (
              <div 
                key={agent.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors">
                      <Link href={`/agents/${agent.slug}`}>
                        {agent.name}
                      </Link>
                    </h3>
                    {agent.platform && (
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {agent.platform}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {agent.short_description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">AI 搜索:</span>
                        <span className="text-sm font-semibold text-purple-600 ml-1">{agent.ai_search_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">浏览:</span>
                        <span className="text-sm font-semibold text-gray-600 ml-1">{agent.view_count}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link 
                      href={`/agents/${agent.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      查看详情 →
                    </Link>
                    
                    {agent.ai_search_count > 50 && (
                      <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                        <Award className="h-3 w-3" />
                        热门 Agent
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {((agentTab === 'popular' ? popularAgents : newAgents)?.length === 0) && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">暂无 Agent 数据</h3>
              <p className="text-gray-600 mb-6">运行爬虫来获取 Agent 信息</p>
              <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
                npm run crawler
              </code>
            </div>
          )}
        </section>
      )}
      
      {/* 发布 Agent 内容 */}
      {viewMode === 'publish' && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">发布你的 AI Agent</h2>
            <p className="text-gray-600 mb-8">
              贴上你的 Agent 网页链接，我们将自动分析并生成结构化的 Agent 卡片，
              供 AI 搜索引擎发现和推荐。
            </p>
            
            <form 
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const url = formData.get('agent-url') as string
                const description = formData.get('agent-description') as string
                const category = formData.get('agent-category') as string
                
                // Add https:// if not present
                const fullUrl = url.startsWith('http') ? url : `https://${url}`
                
                try {
                  setSubmitting(true)
                  const response = await fetch('/api/agents', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      url: fullUrl,
                      description,
                      category
                    }),
                  })
                  
                  if (response.ok) {
                    const result = await response.json()
                    setMessage({ type: 'success', text: 'Agent 提交成功！我们已开始分析你的 Agent 信息。' })
                    // Clear form
                    (e.target as HTMLFormElement).reset()
                    // Redirect to market view after delay
                    setTimeout(() => {
                      setViewMode('market')
                      setMessage(null)
                    }, 2000)
                  } else {
                    const error = await response.json()
                    setMessage({ type: 'error', text: error.error || '提交失败，请稍后重试。' })
                  }
                } catch (error) {
                  setMessage({ type: 'error', text: '网络错误，请检查连接或稍后重试。' })
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.text}
                </div>
              )}
              
              <div>
                <label htmlFor="agent-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Agent 网页链接
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    https://
                  </span>
                  <input
                    id="agent-url"
                    name="agent-url"
                    type="text"
                    placeholder="your-agent-url.com"
                    className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-r-md sm:text-sm border border-gray-300"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  我们将抓取并分析此页面内容
                </p>
              </div>
              
              <div>
                <label htmlFor="agent-description" className="block text-sm font-medium text-gray-700 mb-2">
                  简短描述（可选）
                </label>
                <textarea
                  id="agent-description"
                  name="agent-description"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="描述你的 Agent 能做什么"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="agent-category" className="block text-sm font-medium text-gray-700 mb-2">
                  分类（可选）
                </label>
                <select
                  id="agent-category"
                  name="agent-category"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">选择分类</option>
                  <option value="productivity">生产力</option>
                  <option value="writing">写作助手</option>
                  <option value="coding">编程助手</option>
                  <option value="design">设计创意</option>
                  <option value="research">研究分析</option>
                  <option value="education">教育学习</option>
                  <option value="business">商业管理</option>
                </select>
              </div>
              
              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                  disabled={submitting}
                >
                  {submitting ? '提交中...' : '提交分析'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  )
}