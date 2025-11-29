# 错误处理指南

本文档介绍如何在Super Alpha Agent项目中使用错误处理功能。

## 目录

1. [错误边界组件](#错误边界组件)
2. [Toast通知系统](#toast通知系统)
3. [日志系统](#日志系统)
4. [最佳实践](#最佳实践)

## 错误边界组件

### 全局错误边界

项目包含以下错误边界组件：

- `app/error.tsx` - 全局错误边界，捕获应用级错误
- `app/not-found.tsx` - 全局404页面
- `app/agents/error.tsx` - Agent页面特定错误边界
- `app/agents/[slug]/not-found.tsx` - Agent详情页404页面

### 工作原理

Next.js会自动使用这些错误边界组件：

```typescript
// 当组件抛出错误时，最近的error.tsx会捕获它
export default async function SomePage() {
  const data = await fetchData() // 如果失败，error.tsx会显示
  return <div>{data}</div>
}

// 当调用notFound()时，not-found.tsx会显示
import { notFound } from 'next/navigation'

export default async function AgentPage({ params }) {
  const agent = await getAgent(params.slug)
  
  if (!agent) {
    notFound() // 触发not-found.tsx
  }
  
  return <AgentDetail agent={agent} />
}
```

### 自定义错误页面

错误页面提供以下功能：

- 友好的错误消息
- 重试按钮（error.tsx）
- 返回首页链接
- 开发环境显示错误详情
- 联系支持信息

## Toast通知系统

### 基本使用

在客户端组件中使用Toast通知：

```typescript
'use client'

import { useToast } from '@/components/toast-provider'

export function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  
  const handleSubmit = async () => {
    try {
      await submitData()
      showSuccess('提交成功！')
    } catch (error) {
      showError('提交失败，请重试')
    }
  }
  
  return <button onClick={handleSubmit}>提交</button>
}
```

### Toast类型

```typescript
// 成功消息（绿色）
showSuccess('操作成功！')

// 错误消息（红色）
showError('操作失败，请重试')

// 警告消息（黄色）
showWarning('请注意：数据可能不完整')

// 信息消息（蓝色）
showInfo('正在处理您的请求...')

// 自定义持续时间（默认5000ms）
showSuccess('保存成功！', 3000)
```

### Toast特性

- 自动消失（默认5秒）
- 可手动关闭
- 支持多个Toast同时显示
- 响应式设计
- 无障碍支持（ARIA标签）

## 日志系统

### 基本使用

```typescript
import { logger } from '@/lib/logger'

// 记录一般信息
logger.info('UserService', '用户登录成功', { userId: '123' })

// 记录警告
logger.warn('PaymentService', '支付超时', { orderId: '456' })

// 记录错误
try {
  await riskyOperation()
} catch (error) {
  logger.error('DataService', error, { context: 'additional info' })
}

// 调试信息（仅开发环境）
logger.debug('CacheService', '缓存命中', { key: 'user:123' })
```

### 专用日志方法

#### API日志

```typescript
// 记录API请求
logger.apiRequest('POST', '/api/submit-agent', { body: data })

// 记录API响应
const startTime = Date.now()
const response = await fetch('/api/agents')
const duration = Date.now() - startTime
logger.apiResponse('GET', '/api/agents', response.status, duration)
```

#### 数据库日志

```typescript
// 记录数据库操作
logger.database('SELECT', 'agents', { filters: { status: 'active' } })

// 记录数据库错误
try {
  await supabase.from('agents').insert(data)
} catch (error) {
  logger.databaseError('INSERT', 'agents', error, { data })
}
```

#### 爬虫日志

```typescript
// 记录爬虫操作
logger.crawler('fetch', 'https://example.com/agent', { timeout: 30000 })

// 记录爬虫错误
try {
  await page.goto(url)
} catch (error) {
  logger.crawlerError('navigate', url, error)
}
```

#### AI分析日志

```typescript
// 记录AI操作
logger.ai('analyze', 'qwen-2.5-72b', { tokens: 1500 })

// 记录AI错误
try {
  const result = await openai.chat.completions.create(...)
} catch (error) {
  logger.aiError('completion', 'qwen-2.5-72b', error)
}
```

#### 性能日志

```typescript
const startTime = Date.now()
await expensiveOperation()
const duration = Date.now() - startTime

logger.performance('page-load', duration, 'ms', { page: '/agents' })
```

#### 用户操作日志

```typescript
logger.userAction('submit-agent', userId, { 
  agentUrl: 'https://example.com',
  timestamp: new Date().toISOString()
})
```

### 日志级别

- `debug` - 调试信息（仅开发环境）
- `info` - 一般信息
- `warn` - 警告信息
- `error` - 错误信息

### 生产环境集成

在生产环境中，日志系统可以集成第三方监控服务：

```typescript
// lib/logger.ts中的sendToMonitoring方法
private sendToMonitoring(entry: LogEntry): void {
  if (!this.isProduction) return

  // 集成Sentry
  if (entry.level === 'error' && entry.error) {
    Sentry.captureException(entry.error, {
      contexts: {
        custom: {
          context: entry.context,
          metadata: entry.metadata
        }
      }
    })
  }
}
```

## 最佳实践

### 1. 错误边界

- 在关键功能周围使用错误边界
- 提供有意义的错误消息
- 始终提供恢复路径（重试、返回首页）
- 在开发环境显示详细错误信息

### 2. Toast通知

- 成功操作使用`showSuccess`
- 失败操作使用`showError`
- 需要用户注意时使用`showWarning`
- 提供信息时使用`showInfo`
- 保持消息简短明了
- 避免技术术语，使用用户友好的语言

### 3. 日志记录

- 记录所有错误和警告
- 在关键操作前后记录日志
- 包含足够的上下文信息
- 避免记录敏感信息（密码、令牌等）
- 使用适当的日志级别
- 在生产环境集成监控服务

### 4. 错误处理流程

```typescript
// 推荐的错误处理模式
export async function handleAgentSubmission(url: string) {
  const startTime = Date.now()
  
  try {
    // 记录开始
    logger.info('AgentSubmission', '开始处理Agent提交', { url })
    
    // 验证输入
    if (!isValidURL(url)) {
      logger.warn('AgentSubmission', 'URL验证失败', { url })
      throw new Error('无效的URL格式')
    }
    
    // 执行操作
    const result = await processAgent(url)
    
    // 记录成功
    const duration = Date.now() - startTime
    logger.performance('agent-submission', duration)
    logger.info('AgentSubmission', '处理成功', { url, agentId: result.id })
    
    return { success: true, data: result }
    
  } catch (error) {
    // 记录错误
    logger.error('AgentSubmission', error, { url })
    
    // 返回友好的错误消息
    return { 
      success: false, 
      error: '处理Agent时发生错误，请稍后重试' 
    }
  }
}
```

### 5. 用户体验

- 始终提供清晰的错误消息
- 提供具体的解决方案
- 避免显示技术错误详情给用户
- 提供联系支持的方式
- 在适当的时候提供重试选项

## 示例：完整的错误处理流程

```typescript
'use client'

import { useState } from 'react'
import { useToast } from '@/components/toast-provider'
import { logger } from '@/lib/logger'

export function PublishAgentForm() {
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  
  const handleSubmit = async (url: string) => {
    setLoading(true)
    
    try {
      // 记录用户操作
      logger.userAction('submit-agent-form', undefined, { url })
      
      // 调用API
      const response = await fetch('/api/submit-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_url: url })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '提交失败')
      }
      
      // 成功
      showSuccess('Agent提交成功！正在处理中...')
      logger.info('PublishAgentForm', '提交成功', { agentId: data.agentId })
      
    } catch (error) {
      // 失败
      showError(error.message || '提交失败，请重试')
      logger.error('PublishAgentForm', error, { url })
      
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit(formData.get('url') as string)
    }}>
      <input name="url" type="url" required />
      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '提交Agent'}
      </button>
    </form>
  )
}
```

## 总结

良好的错误处理包括：

1. **预防** - 输入验证、类型检查
2. **捕获** - 错误边界、try-catch
3. **记录** - 日志系统、监控集成
4. **通知** - Toast消息、错误页面
5. **恢复** - 重试机制、降级方案

遵循这些实践可以提供更好的用户体验和更容易维护的代码。
