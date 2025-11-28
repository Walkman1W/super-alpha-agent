'use client'

import { useState, useCallback, FormEvent } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle, Link as LinkIcon, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/**
 * 表单数据类型
 */
export interface PublishAgentFormData {
  url: string
  email?: string
  notes?: string
}

/**
 * 表单验证错误
 */
export interface FormErrors {
  url?: string
  email?: string
  notes?: string
}

/**
 * 提交状态
 */
export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 组件属性
 */
export interface PublishAgentFormProps {
  onSubmit?: (data: PublishAgentFormData) => Promise<void>
  className?: string
}

/**
 * 验证URL格式
 */
export function validateURLFormat(url: string): string | undefined {
  if (!url.trim()) {
    return 'URL不能为空'
  }
  
  try {
    const parsed = new URL(url.trim())
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '只支持http或https协议'
    }
    return undefined
  } catch {
    return '请输入有效的URL格式'
  }
}

/**
 * 验证Email格式
 */
export function validateEmailFormat(email: string): string | undefined {
  if (!email.trim()) {
    return undefined // Email是可选的
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return '请输入有效的邮箱地址'
  }
  return undefined
}


/**
 * 验证表单数据
 */
export function validateForm(data: PublishAgentFormData): FormErrors {
  const errors: FormErrors = {}
  
  const urlError = validateURLFormat(data.url)
  if (urlError) {
    errors.url = urlError
  }
  
  const emailError = validateEmailFormat(data.email || '')
  if (emailError) {
    errors.email = emailError
  }
  
  // Notes 长度限制
  if (data.notes && data.notes.length > 1000) {
    errors.notes = '备注不能超过1000个字符'
  }
  
  return errors
}

/**
 * PublishAgentForm 组件
 * 用于提交新的AI Agent到平台
 * 
 * 需求: 5.1, 5.2, 10.2, 10.3
 */
export function PublishAgentForm({ onSubmit, className }: PublishAgentFormProps) {
  const [formData, setFormData] = useState<PublishAgentFormData>({
    url: '',
    email: '',
    notes: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState<string>('')
  
  // 处理输入变化
  const handleChange = useCallback((
    field: keyof PublishAgentFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])
  
  // 处理表单提交
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setStatus('loading')
    setSubmitMessage('')
    
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // 默认提交到API
        const response = await fetch('/api/submit-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '提交失败')
        }
      }
      
      setStatus('success')
      setSubmitMessage('提交成功！我们会尽快处理你的Agent。')
      // 重置表单
      setFormData({ url: '', email: '', notes: '' })
    } catch (error) {
      setStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : '提交失败，请稍后重试')
    }
  }, [formData, onSubmit])
  
  const isLoading = status === 'loading'
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
      aria-label="发布Agent表单"
    >
      {/* URL 输入 - 必填 */}
      <div className="space-y-2">
        <Input
          type="url"
          name="url"
          label="Agent URL *"
          placeholder="https://example.com/your-agent"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
          error={errors.url}
          helperText="支持 GPT Store、Poe、GitHub 等平台链接"
          disabled={isLoading}
          required
          autoComplete="url"
          inputMode="url"
          aria-required="true"
        />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>我们会自动抓取和分析你的Agent信息</span>
        </div>
      </div>
      
      {/* Email 输入 - 可选 */}
      <div className="space-y-2">
        <Input
          type="email"
          name="email"
          label="联系邮箱（可选）"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          helperText="用于接收审核结果通知"
          disabled={isLoading}
          autoComplete="email"
          inputMode="email"
        />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          <span>我们不会向你发送垃圾邮件</span>
        </div>
      </div>
      
      {/* Notes 输入 - 可选 */}
      <div className="space-y-2">
        <Textarea
          name="notes"
          label="补充说明（可选）"
          placeholder="关于你的Agent的任何补充信息..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          error={errors.notes}
          helperText={`${formData.notes?.length || 0}/1000 字符`}
          disabled={isLoading}
          rows={4}
          maxLength={1000}
        />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>可以补充Agent的特色功能或使用场景</span>
        </div>
      </div>
      
      {/* 提交状态消息 */}
      {submitMessage && (
        <div 
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg',
            status === 'success' && 'bg-green-50 text-green-700 border border-green-200',
            status === 'error' && 'bg-red-50 text-red-700 border border-red-200'
          )}
          role="alert"
          aria-live="polite"
        >
          {status === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          )}
          <span className="text-sm">{submitMessage}</span>
        </div>
      )}
      
      {/* 提交按钮 */}
      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full min-h-[48px] text-base font-semibold',
          'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
        )}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
            <span>正在分析...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" aria-hidden="true" />
            <span>提交 Agent</span>
          </>
        )}
      </Button>
      
      {/* 提示信息 */}
      <p className="text-xs text-center text-gray-500">
        提交即表示你同意我们的服务条款。我们会在24小时内审核你的Agent。
      </p>
    </form>
  )
}

export default PublishAgentForm
