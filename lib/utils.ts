import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL验证和清理函数
export function validateURL(url: string): string | null {
  try {
    // 解析URL
    const parsedUrl = new URL(url);
    
    // 只允许http/https协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    // 清理和规范化URL
    const cleanedUrl = parsedUrl.toString();
    
    return cleanedUrl;
  } catch (error) {
    // 处理无效URL
    return null;
  }
}
