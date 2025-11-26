'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    official_url: '',
    platform: '',
    category_id: '',
    short_description: '',
    long_description: '',
    key_features: '',
    use_cases: '',
    pros: '',
    cons: '',
    pricing: 'Free',
    tags: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    setSubmitStatus('')

    try {
      const supabase = createClient()
      
      // 解析数组字段
      const processedData = {
        ...formData,
        key_features: formData.key_features.split('\n').filter(f => f.trim()),
        use_cases: formData.use_cases.split('\n').filter(f => f.trim()),
        pros: formData.pros.split('\n').filter(f => f.trim()),
        cons: formData.cons.split('\n').filter(f => f.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        status: 'pending'
      }

      const { error } = await supabase
        .from('user_submissions')
        .insert([processedData])

      if (error) {
        throw error
      }

      setSubmitStatus('success')
      setSubmitMessage('✅ Agent 提交成功！我们会在 24 小时内审核您的提交。')
      
      // 重置表单
      setFormData({
        name: '',
        official_url: '',
        platform: '',
        category_id: '',
        short_description: '',
        long_description: '',
        key_features: '',
        use_cases: '',
        pros: '',
        cons: '',
        pricing: 'Free',
        tags: ''
      })
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
      setSubmitMessage('❌ 提交失败，请稍后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* 背景动画 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-black/50 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 导航栏 */}
        <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <a href="/hero" className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div className="text-white">
                  <div className="font-bold text-xl">Super Alpha Agent</div>
                  <div className="text-xs text-gray-300">AI Agent 发现平台</div>
                </div>
              </a>
              
              <div className="flex items-center gap-4">
                <a href="/market" className="px-6 py-2 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all">
                  🛒 Agent市场
                </a>
                <a href="/submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium">
                  🚀 发布Agent
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">提交您的 AI Agent</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                发布您的 Agent
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                将您的 AI Agent 提交到我们的平台
                <br />
                让更多用户通过 AI 搜索引擎发现它
              </p>
            </div>

            {/* 提交表单 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本信息 */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Agent 名称 *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：ChatGPT"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">
                      官方网站 *
                    </label>
                    <input
                      type="url"
                      name="official_url"
                      value={formData.official_url}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      平台 *
                    </label>
                    <input
                      type="text"
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：OpenAI"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">
                      定价模式 *
                    </label>
                    <select
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Free">免费</option>
                      <option value="Freemium">免费增值</option>
                      <option value="Subscription">订阅制</option>
                      <option value="One-time">一次性付费</option>
                      <option value="Custom">定制价格</option>
                    </select>
                  </div>
                </div>

                {/* 描述信息 */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    简短描述 *
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    maxLength={200}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="用一句话描述您的 Agent 的主要功能"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formData.short_description.length}/200 字符
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    详细介绍
                  </label>
                  <textarea
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="详细描述您的 Agent 的功能、特点等"
                  />
                </div>

                {/* 功能特性 */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    核心功能
                  </label>
                  <textarea
                    name="key_features"
                    value={formData.key_features}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="每行输入一个核心功能"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    使用场景
                  </label>
                  <textarea
                    name="use_cases"
                    value={formData.use_cases}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="每行输入一个使用场景"
                  />
                </div>

                {/* 优缺点 */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      优势
                    </label>
                    <textarea
                      name="pros"
                      value={formData.pros}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="每行输入一个优势"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">
                      缺点
                    </label>
                    <textarea
                      name="cons"
                      value={formData.cons}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="每行输入一个缺点"
                    />
                  </div>
                </div>

                {/* 标签 */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    标签
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="用逗号分隔多个标签，例如：AI, 聊天, 生产力"
                  />
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        提交中...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>🚀</span>
                        提交 Agent
                      </span>
                    )}
                  </button>
                </div>

                {/* 提交状态消息 */}
                {submitMessage && (
                  <div className={`mt-6 p-4 rounded-lg text-center ${
                    submitStatus === 'success' 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                      : 'bg-red-500/20 border border-red-500/30 text-red-300'
                  }`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}