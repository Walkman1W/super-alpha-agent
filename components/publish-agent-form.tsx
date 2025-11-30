'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { validateURL } from '@/lib/utils'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * PublishAgentForm 组件状态
 */
interface FormState {
  url: string
  email?: string
  notes?: string
}

/**
 * 表单错误类型
 */
interface FormErrors {
  url?: string
  email?: string
}

/**
 * 提交状态
 */
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * PublishAgentForm 组件
 * 用于提交新的Agent URL进行分析和发布
 * 
 * 需求: 5.1, 5.2, 10.3
 */
export function PublishAgentForm() {
  // 表单状态
  const [formState, setFormState] = useState<FormState>({
    url: '',
    email: '',
    notes: ''
  })
  
  // 错误状态
  const [errors, setErrors] = useState<FormErrors>({})
  
  // 提交状态
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  
  // 消息状态
  const [message, setMessage] = useState<string>('')

  /**
   * 输入变化处理
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
    
    // 清除对应字段的错误
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // URL验证
    if (!formState.url.trim()) {
      newErrors.url = '请输入Agent的URL'
    } else if (!validateURL(formState.url)) {
      newErrors.url = '请输入有效的URL（以http://或https://开头）'
    }
    
    // Email验证（可选字段但需要验证格式如果提供了值）
    if (formState.email && formState.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formState.email)) {
        newErrors.email = '请输入有效的电子邮件地址'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 表单提交处理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitStatus('loading')
      setMessage('')
      
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 这里应该替换为实际的API调用
      console.log('提交表单数据:', formState)
      
      // 成功状态
      setSubmitStatus('success')
      setMessage('Agent提交成功！我们将尽快审核并发布。')
      
      // 重置表单
      setFormState({
        url: '',
        email: '',
        notes: ''
      })
      
      // 5秒后重置状态
      setTimeout(() => {
        setSubmitStatus('idle')
        setMessage('')
      }, 5000)
      
    } catch (error) {
      console.error('提交失败:', error)
      setSubmitStatus('error')
      setMessage('提交失败，请稍后再试。')
      
      // 5秒后重置状态
      setTimeout(() => {
        setSubmitStatus('idle')
        setMessage('')
      }, 5000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div 
        className={cn(
          'bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg',
          submitStatus === 'success' && 'border-green-500/50',
          submitStatus === 'error' && 'border-red-500/50'
        )}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">发布新Agent</h2>
        
        {/* 消息提示 */}
        {message && (
          <div 
            className={cn(
              'flex items-center gap-3 p-4 rounded-lg mb-6',
              submitStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            )}
          >
            {submitStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{message}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* URL输入 */}
          <div className="mb-6">
            <label 
              htmlFor="url" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Agent URL <span className="text-red-500">*</span>
            </label>
            <input 
              type="url" 
              id="url" 
              name="url"
              value={formState.url}
              onChange={handleChange}
              placeholder="https://example.com/agent"
              className={cn(
                'w-full px-4 py-3 rounded-lg border',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.url ? 'border-red-500' : 'border-gray-300',
                'transition-all duration-200'
              )}
              disabled={submitStatus === 'loading'}
              required
            />
            {errors.url && (
              <p className="mt-2 text-sm text-red-500">{errors.url}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              请输入Agent的官方URL（例如：https://chat.openai.com/g/example-agent）
            </p>
          </div>
          
          {/* Email输入 */}
          <div className="mb-6">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              联系邮箱（可选）
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={cn(
                'w-full px-4 py-3 rounded-lg border',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.email ? 'border-red-500' : 'border-gray-300',
                'transition-all duration-200'
              )}
              disabled={submitStatus === 'loading'}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              提供您的邮箱以便我们在审核通过后通知您（不会公开显示）
            </p>
          </div>
          
          {/* Notes输入 */}
          <div className="mb-8">
            <label 
              htmlFor="notes" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              备注（可选）
            </label>
            <textarea 
              id="notes" 
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              placeholder="关于这个Agent的额外信息..."
              rows={4}
              className={cn(
                'w-full px-4 py-3 rounded-lg border border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'transition-all duration-200',
                'resize-vertical'
              )}
              disabled={submitStatus === 'loading'}
            />
            <p className="mt-2 text-sm text-gray-500">
              提供关于这个Agent的额外信息，帮助我们更好地审核和展示
            </p>
          </div>
          
          {/* 提交按钮 */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={submitStatus === 'loading'}
              className="min-h-[48px] px-8"
            >
              {submitStatus === 'loading' ? (
                <> 
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  提交中... 
                </>
              ) : (
                '提交Agent'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}