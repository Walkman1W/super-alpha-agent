/**
 * IndexNow Service
 * 
 * 主动通知搜索引擎内容更新，加速索引
 * 
 * 支持的搜索引擎:
 * - Bing
 * - Yandex
 * - 其他支持 IndexNow 协议的搜索引擎
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { logger } from '@/lib/logger'

interface IndexNowConfig {
  key: string
  keyLocation: string
  host: string
}

interface IndexNowResult {
  success: boolean
  url: string
  error?: string
}

/**
 * 获取 IndexNow 配置
 */
function getIndexNowConfig(): IndexNowConfig | null {
  const key = process.env.INDEXNOW_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (!key || !siteUrl) {
    logger.warn('IndexNow', 'Not configured: missing INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL')
    return null
  }
  
  const host = new URL(siteUrl).hostname
  const keyLocation = `${siteUrl}/${key}.txt`
  
  return { key, keyLocation, host }
}

/**
 * 向 IndexNow API 发送单个 URL 通知
 * 
 * Requirements: 4.1, 4.2
 */
async function submitToIndexNow(url: string, config: IndexNowConfig): Promise<IndexNowResult> {
  try {
    // IndexNow API endpoint (Bing)
    const apiUrl = 'https://api.indexnow.org/indexnow'
    
    const payload = {
      host: config.host,
      key: config.key,
      keyLocation: config.keyLocation,
      urlList: [url]
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    
    // IndexNow 返回 200 表示成功，202 表示已接受
    if (response.ok) {
      logger.info('IndexNow', `Successfully notified for ${url}`)
      return { success: true, url }
    }
    
    const errorText = await response.text().catch(() => 'Unknown error')
    logger.error('IndexNow', `Failed to notify ${url}, status: ${response.status}, error: ${errorText}`)
    
    return {
      success: false,
      url,
      error: `HTTP ${response.status}: ${errorText}`
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error')
    logger.error('IndexNow', `Exception for ${url}: ${errorMessage}`)
    
    return {
      success: false,
      url,
      error: errorMessage
    }
  }
}

/**
 * 批量通知 IndexNow
 * 
 * 将多个 URL 合并为批量请求，避免超过 API 限制
 * IndexNow 支持单次最多 10,000 个 URL
 * 
 * Requirements: 4.4
 */
export async function batchNotify(urls: string[], batchSize: number = 10000): Promise<void> {
  const config = getIndexNowConfig()
  
  if (!config) {
    logger.warn('IndexNow', 'Skipping batch notification (not configured)')
    return
  }
  
  if (urls.length === 0) {
    return
  }
  
  // 分批处理
  const batches = []
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize))
  }
  
  logger.info('IndexNow', `Processing ${urls.length} URLs in ${batches.length} batch(es)`)
  
  for (const batch of batches) {
    try {
      const apiUrl = 'https://api.indexnow.org/indexnow'
      
      const payload = {
        host: config.host,
        key: config.key,
        keyLocation: config.keyLocation,
        urlList: batch
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        logger.info('IndexNow', `Successfully notified batch of ${batch.length} URLs`)
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        logger.error('IndexNow', `Batch notification failed, status: ${response.status}, error: ${errorText}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error')
      logger.error('IndexNow', `Batch exception: ${errorMessage}`)
    }
    
    // 添加延迟避免速率限制
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

/**
 * 通知 IndexNow 一个或多个 URL
 * 
 * 错误不会抛出，只会记录日志，确保不阻塞主流程
 * 
 * Requirements: 4.1, 4.2, 4.3
 */
export async function notifyIndexNow(urls: string[]): Promise<IndexNowResult[]> {
  const config = getIndexNowConfig()
  
  if (!config) {
    logger.warn('IndexNow', 'Skipping notification (not configured)')
    return urls.map(url => ({ success: false, url, error: 'Not configured' }))
  }
  
  if (urls.length === 0) {
    return []
  }
  
  // 过滤无效 URL
  const validUrls = urls.filter(url => {
    try {
      new URL(url)
      return true
    } catch {
      logger.warn('IndexNow', `Invalid URL skipped: ${url}`)
      return false
    }
  })
  
  if (validUrls.length === 0) {
    return []
  }
  
  // 对于少量 URL，逐个发送；对于大量 URL，使用批量接口
  if (validUrls.length <= 3) {
    const results: IndexNowResult[] = []
    
    for (const url of validUrls) {
      const result = await submitToIndexNow(url, config)
      results.push(result)
      
      // 添加小延迟避免速率限制
      if (validUrls.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return results
  } else {
    // 使用批量接口
    await batchNotify(validUrls)
    return validUrls.map(url => ({ success: true, url }))
  }
}

/**
 * 通知 Agent 发布
 * 
 * Requirements: 4.1
 */
export async function notifyAgentPublished(agentSlug: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (!siteUrl) {
    logger.warn('IndexNow', 'Cannot notify agent published (NEXT_PUBLIC_SITE_URL not set)')
    return
  }
  
  const agentUrl = `${siteUrl}/agents/${agentSlug}`
  
  try {
    await notifyIndexNow([agentUrl])
  } catch (error) {
    // 错误已在 notifyIndexNow 中记录，这里不再抛出
    logger.error('IndexNow', `Failed to notify agent published: ${agentSlug}`)
  }
}

/**
 * 通知 Agent 更新
 * 
 * Requirements: 4.2
 */
export async function notifyAgentUpdated(agentSlug: string): Promise<void> {
  // 更新和发布使用相同的逻辑
  await notifyAgentPublished(agentSlug)
}
