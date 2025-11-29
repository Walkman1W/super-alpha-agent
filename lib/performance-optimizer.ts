/**
 * 性能优化工具集
 * 提供各种性能优化辅助函数
 */

/**
 * 防抖函数 - 减少高频事件的执行次数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数 - 限制函数执行频率
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 延迟加载 - 使用 requestIdleCallback 在空闲时执行
 */
export function runWhenIdle(callback: () => void, timeout: number = 2000) {
  if (typeof window === 'undefined') return
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * 批量处理 - 将大量操作分批执行，避免阻塞主线程
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R | Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
    
    // 让出主线程，避免长时间阻塞
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  return results
}

/**
 * 预加载关键资源
 */
export function preloadResource(href: string, as: string) {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

/**
 * 预连接到域名
 */
export function preconnect(href: string) {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = href
  document.head.appendChild(link)
}

/**
 * 测量函数执行时间
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
  
  return result
}

/**
 * 虚拟滚动辅助函数 - 计算可见范围
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + overscan * 2)
  
  return { start, end }
}
