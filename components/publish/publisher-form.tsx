'use client'

/**
 * PublisherForm 组件
 * 终端风格的 Agent 发布表单，带实时 JSON-LD 预览
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
 */

import { useState, useCallback, useEffect, FormEvent } from 'react'
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Link as LinkIcon,
  Code,
  Terminal,
  Copy,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  validateUrl, 
  validatePublishForm, 
  isFormValid,
  type PublishFormData,
  type PublishFormErrors
} from '@/lib/validation'
import { 
  generateJsonLd, 
  stringifyJsonLd,
  type AgentJsonLdInput
} from '@/lib/json-ld'
import type { EntityType, AutonomyLevel } from '@/lib/types/agent'

export interface PublisherFormProps {
  onSubmit?: (data: PublishFormData) => Promise<void>
  className?: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const CATEGORIES = [
  { value: 'development', label: '开发工具' },
  { value: 'content-creation', label: '内容创作' },
  { value: 'data-analysis', label: '数据分析' },
  { value: 'design', label: '设计' },
  { value: 'marketing', label: '营销' },
  { value: 'customer-service', label: '客服' },
  { value: 'education', label: '教育' },
  { value: 'research', label: '研究' },
  { value: 'productivity', label: '生产力' },
  { value: 'other', label: '其他' }
]

const ENTITY_TYPES: { value: EntityType; label: string; icon: string }[] = [
  { value: 'repo', label: 'Repository', icon: '📦' },
  { value: 'saas', label: 'SaaS', icon: '🌐' },
  { value: 'app', label: 'App', icon: '📱' }
]

const AUTONOMY_LEVELS: { value: AutonomyLevel; label: string; desc: string }[] = [
  { value: 'L1', label: 'L1', desc: '基础自动化' },
  { value: 'L2', label: 'L2', desc: '辅助决策' },
  { value: 'L3', label: 'L3', desc: '有限自主' },
  { value: 'L4', label: 'L4', desc: '高度自主' },
  { value: 'L5', label: 'L5', desc: '完全自主' }
]

const FRAMEWORKS = [
  'LangChain',
  'AutoGPT',
  'BabyAGI',
  'LlamaIndex',
  'CrewAI',
  'AutoGen',
  'Custom'
]

export function PublisherForm({ onSubmit, className }: PublisherFormProps) {
  const [formData, setFormData] = useState<Partial<PublishFormData>>({
    url: '',
    name: '',
    description: '',
    category: '',
    entityType: 'saas',
    autonomyLevel: 'L2',
    email: '',
    framework: '',
    tags: []
  })
  
  const [errors, setErrors] = useState<PublishFormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [urlValidating, setUrlValidating] = useState(false)
  const [urlValid, setUrlValid] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  // 实时 URL 验证
  useEffect(() => {
    if (!formData.url) {
      setUrlValid(null)
      return
    }
    
    setUrlValidating(true)
    const timer = setTimeout(() => {
      const result = validateUrl(formData.url || '')
      setUrlValid(result.isValid)
      setUrlValidating(false)
      if (!result.isValid) {
        setErrors(prev => ({ ...prev, url: result.error }))
      } else {
        setErrors(prev => {
          const { url: _, ...rest } = prev
          return rest
        })
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [formData.url])

  // 生成 JSON-LD 预览
  const jsonLdPreview = useCallback(() => {
    if (!formData.name || !formData.description || !formData.url) {
      return null
    }
    
    const input: AgentJsonLdInput = {
      name: formData.name,
      description: formData.description,
      url: formData.url,
      category: formData.category || 'other',
      entityType: formData.entityType || 'saas',
      autonomyLevel: formData.autonomyLevel || 'L2',
      framework: formData.framework,
      tags: formData.tags,
      dateCreated: new Date().toISOString().split('T')[0]
    }
    
    return generateJsonLd(input)
  }, [formData])

  const handleInputChange = (field: keyof PublishFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除该字段的错误
    if (errors[field as keyof PublishFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof PublishFormErrors]
        return newErrors
      })
    }
  }

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagsInput.trim()
      if (tag && !formData.tags?.includes(tag)) {
        handleInputChange('tags', [...(formData.tags || []), tag])
      }
      setTagsInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', (formData.tags || []).filter(t => t !== tagToRemove))
  }

  const copyJsonLd = async () => {
    const jsonLd = jsonLdPreview()
    if (jsonLd) {
      await navigator.clipboard.writeText(stringifyJsonLd(jsonLd))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validatePublishForm(formData)
    setErrors(validationErrors)
    
    if (!isFormValid(validationErrors)) {
      return
    }
    
    setStatus('loading')
    setSubmitMessage('')
    
    try {
      if (onSubmit) {
        await onSubmit(formData as PublishFormData)
      }
      setStatus('success')
      setSubmitMessage('Agent 提交成功！我们会尽快审核。')
    } catch (error) {
      setStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : '提交失败，请重试')
    }
  }

  const jsonLd = jsonLdPreview()

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* 左侧：表单 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-mono text-zinc-100">发布新 Agent</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URL 输入 */}
          <div>
            <label className="block text-sm font-mono text-zinc-400 mb-2">
              Agent URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://github.com/user/agent"
                className={cn(
                  'w-full bg-zinc-950 border rounded-md pl-10 pr-10 py-2.5',
                  'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
                  'focus:outline-none focus:ring-1',
                  errors.url 
                    ? 'border-red-500/50 focus:ring-red-500/50' 
                    : urlValid 
                      ? 'border-green-500/50 focus:ring-green-500/50'
                      : 'border-zinc-700 focus:ring-purple-500/50'
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {urlValidating && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
                {!urlValidating && urlValid === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                {!urlValidating && urlValid === false && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
            {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url}</p>}
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-sm font-mono text-zinc-400 mb-2">
              名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="My Awesome Agent"
              className={cn(
                'w-full bg-zinc-950 border rounded-md px-3 py-2.5',
                'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
                'focus:outline-none focus:ring-1',
                errors.name ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-purple-500/50'
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-mono text-zinc-400 mb-2">
              描述 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="简要描述你的 Agent 功能..."
              rows={3}
              className={cn(
                'w-full bg-zinc-950 border rounded-md px-3 py-2.5',
                'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
                'focus:outline-none focus:ring-1 resize-none',
                errors.description ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-purple-500/50'
              )}
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
          </div>

          {/* 分类和实体类型 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-zinc-400 mb-2">
                分类 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={cn(
                  'w-full bg-zinc-950 border rounded-md px-3 py-2.5',
                  'font-mono text-sm text-zinc-100',
                  'focus:outline-none focus:ring-1',
                  errors.category ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-purple-500/50'
                )}
              >
                <option value="">选择分类</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-mono text-zinc-400 mb-2">
                类型 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.entityType}
                onChange={(e) => handleInputChange('entityType', e.target.value)}
                className={cn(
                  'w-full bg-zinc-950 border rounded-md px-3 py-2.5',
                  'font-mono text-sm text-zinc-100',
                  'focus:outline-none focus:ring-1',
                  errors.entityType ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-purple-500/50'
                )}
              >
                {ENTITY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 自主等级和框架 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-zinc-400 mb-2">
                自主等级 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.autonomyLevel}
                onChange={(e) => handleInputChange('autonomyLevel', e.target.value)}
                className={cn(
                  'w-full bg-zinc-950 border rounded-md px-3 py-2.5',
                  'font-mono text-sm text-zinc-100',
                  'focus:outline-none focus:ring-1 border-zinc-700 focus:ring-purple-500/50'
                )}
              >
                {AUTONOMY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label} - {level.desc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-mono text-zinc-400 mb-2">框架</label>
              <select
                value={formData.framework}
                onChange={(e) => handleInputChange('framework', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="">选择框架</option>
                {FRAMEWORKS.map(fw => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-mono text-zinc-400 mb-2">标签</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-300"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleTagsKeyDown}
              placeholder="输入标签后按 Enter"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-mono text-zinc-400 mb-2">联系邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className={cn(
                'w-full bg-zinc-950 border rounded-md px-3 py-2.5',
                'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
                'focus:outline-none focus:ring-1',
                errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-purple-500/50'
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3',
              'bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50',
              'text-white font-mono text-sm rounded-md',
              'transition-colors duration-200'
            )}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                提交 Agent
              </>
            )}
          </button>

          {/* 提交状态消息 */}
          {submitMessage && (
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-md font-mono text-sm',
              status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}>
              {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {submitMessage}
            </div>
          )}
        </form>
      </div>

      {/* 右侧：JSON-LD 预览 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-mono text-zinc-100">JSON-LD 预览</h2>
          </div>
          {jsonLd && (
            <button
              type="button"
              onClick={copyJsonLd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-mono text-zinc-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 min-h-[400px] overflow-auto">
          {jsonLd ? (
            <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
              <code>{stringifyJsonLd(jsonLd)}</code>
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-sm">
              <Code className="w-8 h-8 mb-2 opacity-50" />
              <p>填写表单后预览 JSON-LD</p>
              <p className="text-xs mt-1">需要填写名称、描述和 URL</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs font-mono text-zinc-500">
          JSON-LD 结构化数据将帮助 AI 搜索引擎更好地理解你的 Agent
        </p>
      </div>
    </div>
  )
}
