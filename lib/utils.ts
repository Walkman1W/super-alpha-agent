import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 验证和清理URL
 * @param url 要验证的URL
 * @returns 清理后的URL或null（如果无效）
 * @需求: 5.2
 */
export function validateURL(url: string): string | null {
  try {
    // 创建URL对象进行验证
    const parsedUrl = new URL(url)
    
    // 只允许http和https协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null
    }
    
    // 清理URL：移除哈希和搜索参数（可选，根据需求调整）
    const cleanedUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`
    
    return cleanedUrl
  } catch (error) {
    // 如果URL格式无效，返回null
    return null
  }
}