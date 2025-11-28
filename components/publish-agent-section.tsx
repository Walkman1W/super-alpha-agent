'use client'

import { useState, useCallback, FormEvent } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle, Sparkles, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Step = 'form' | 'verify' | 'success'
type Status = 'idle' | 'loading' | 'error'

/**
 * 发布Agent区域 - 邮箱验证流程
 */
export function PublishAgentSection() {
  const [step, setStep] = useState<Step>('form')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  
  // 表单数据
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentUrl, setAgentUrl] = useState('')
  
  // 同意条款
  const [agreed, setAgreed] = useState(false)
  
  // 错误
  const [urlError, setUrlError] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateForm = (): boolean => {
    let valid = true
    
    if (!url.trim()) {
      setUrlError('请输入Agent URL')
      valid = false
    } else {
      try {
        const parsed = new URL(url.trim())
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setUrlError('只支持http/https链接')
          valid = false
        } else {
          setUrlError('')
        }
      } catch {
        setUrlError('请输入有效的URL')
        valid = false
      }
    }
    
    if (!email.trim()) {
      setEmailError('请输入邮箱地址')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('请输入有效的邮箱')
      valid = false
    } else {
      setEmailError('')
    }
    
    return valid
  }

  // 步骤1: 提交URL和邮箱，发送验证码
  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !agreed) return

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), email: email.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '提交失败')
      }

      setAgentName(data.agentName || '')
      setStep('verify')
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '提交失败，请重试')
    }
  }

  // 步骤2: 验证验证码
  const handleVerify = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setMessage('请输入6位验证码')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/verify-and-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '验证失败')
      }

      setAgentName(data.agent?.name || agentName)
      setAgentUrl(data.agent?.url || '')
      setStep('success')
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '验证失败，请重试')
    }
  }, [email, code, agentName])

  // 重新发送验证码
  const handleResend = useCallback(async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), email: email.trim() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setMessage('验证码已重新发送')
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '发送失败')
    }
  }, [url, email])

  const isLoading = status === 'loading'

  return (
    <section id="publish" className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute top-5 right-5 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          
          <div className="relative z-10">
            {/* 标题 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-2xl md:text-3xl font-bold">
                <Sparkles className="w-7 h-7" />
                发布你的 AI Agent
              </div>
              <p className="text-white/80 mt-2 text-sm">
                {step === 'form' && '提交URL，验证邮箱后自动上架'}
                {step === 'verify' && '请查收验证码邮件'}
                {step === 'success' && '恭喜！你的Agent已上架'}
              </p>
            </div>

            {/* 步骤1: 表单 */}
            {step === 'form' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* 左侧流程 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                      <span>填写Agent链接和邮箱</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                      <span>AI分析 + 邮箱验证</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                      <span>自动上架，开始获客</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 mt-4">
                    支持 GPT Store、Poe、GitHub 等平台
                  </p>
                </div>

                {/* 右侧表单 */}
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <Input
                    type="url"
                    placeholder="https://chat.openai.com/g/..."
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
                    error={urlError}
                    disabled={isLoading}
                    className="bg-white/95 border-white/30"
                  />

                  <Input
                    type="email"
                    placeholder="你的邮箱（必填）"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                    error={emailError}
                    disabled={isLoading}
                    className="bg-white/95 border-white/30"
                  />

                  {/* 服务条款 */}
                  <label className="flex items-start gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/30"
                    />
                    <span className="text-white/80">
                      我已阅读并同意
                      <a href="/terms" className="underline hover:text-white ml-1">服务条款</a>
                      和
                      <a href="/privacy" className="underline hover:text-white ml-1">隐私政策</a>
                    </span>
                  </label>

                  {message && status === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-red-500/20 text-red-100">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !agreed}
                    className="w-full h-11 bg-white text-indigo-600 hover:bg-gray-100 font-semibold disabled:opacity-50"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />分析中...</>
                    ) : (
                      <><Mail className="w-4 h-4 mr-2" />发送验证码</>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* 步骤2: 验证码 */}
            {step === 'verify' && (
              <div className="max-w-sm mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center mb-4">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-white/80" />
                  <p className="text-sm mb-1">验证码已发送至</p>
                  <p className="font-semibold">{email}</p>
                  {agentName && <p className="text-xs text-white/60 mt-2">Agent: {agentName}</p>}
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="输入6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    className="bg-white/95 border-white/30 text-center text-xl tracking-widest"
                    maxLength={6}
                  />

                  {message && (
                    <div className={cn(
                      'flex items-center gap-2 p-3 rounded-lg text-sm',
                      status === 'error' ? 'bg-red-500/20 text-red-100' : 'bg-green-500/20 text-green-100'
                    )}>
                      {status === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full h-11 bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />验证中...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 mr-2" />验证并上架</>
                    )}
                  </Button>

                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setStep('form'); setCode(''); setMessage('') }}
                      className="text-white/70 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />返回修改
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isLoading}
                      className="text-white/70 hover:text-white"
                    >
                      重新发送
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 步骤3: 成功 */}
            {step === 'success' && (
              <div className="max-w-sm mx-auto text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold mb-2">上架成功！</h3>
                <p className="text-white/80 mb-4">
                  你的Agent <strong>{agentName}</strong> 已上架
                </p>
                {agentUrl && (
                  <a
                    href={agentUrl}
                    className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    查看Agent页面
                  </a>
                )}
                <button
                  onClick={() => { setStep('form'); setUrl(''); setEmail(''); setCode(''); setAgreed(false) }}
                  className="block mx-auto mt-4 text-sm text-white/70 hover:text-white"
                >
                  继续发布其他Agent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PublishAgentSection
