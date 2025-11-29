/**
 * 图片优化工具
 * 提供图片加载、优化和占位符生成功能
 * 需求: 9.2
 */

/**
 * 生成 blur placeholder 数据 URL
 * 用于 Next.js Image 组件的 blurDataURL 属性
 * @param width 宽度
 * @param height 高度
 * @returns base64 编码的 SVG 数据 URL
 */
export function generateBlurDataURL(width: number = 400, height: number = 400): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:rgb(99,102,241);stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:rgb(139,92,246);stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `.trim()
  
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * 生成占位符图片 URL（用于无图片时的默认显示）
 * @param text 显示的文字
 * @param width 宽度
 * @param height 高度
 * @returns SVG 数据 URL
 */
export function generatePlaceholderImage(
  text: string,
  width: number = 200,
  height: number = 200
): string {
  const firstChar = text.charAt(0).toUpperCase()
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(139,92,246);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${width * 0.4}"
        font-weight="bold"
        fill="white"
      >${firstChar}</text>
    </svg>
  `.trim()
  
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * 验证图片 URL 是否有效
 * @param url 图片 URL
 * @returns 是否有效
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * 获取优化的图片尺寸
 * 根据设备像素比和容器尺寸计算最优图片尺寸
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param devicePixelRatio 设备像素比（默认 2）
 * @returns 优化后的尺寸
 */
export function getOptimizedImageSize(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = 2
): { width: number; height: number } {
  return {
    width: Math.ceil(containerWidth * devicePixelRatio),
    height: Math.ceil(containerHeight * devicePixelRatio),
  }
}

/**
 * 图片加载优先级
 */
export type ImagePriority = 'high' | 'low' | 'auto'

/**
 * 获取图片加载优先级
 * @param isAboveFold 是否在首屏
 * @param isHero 是否是 hero 图片
 * @returns 优先级
 */
export function getImagePriority(
  isAboveFold: boolean,
  isHero: boolean = false
): ImagePriority {
  if (isHero) return 'high'
  if (isAboveFold) return 'high'
  return 'low'
}

/**
 * 图片尺寸预设
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
  hero: { width: 1200, height: 630 },
} as const

/**
 * 响应式图片尺寸配置
 * 用于 Next.js Image 组件的 sizes 属性
 */
export const RESPONSIVE_IMAGE_SIZES = {
  thumbnail: '(max-width: 640px) 100px, 100px',
  small: '(max-width: 640px) 150px, 200px',
  medium: '(max-width: 640px) 300px, (max-width: 1024px) 350px, 400px',
  large: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  hero: '100vw',
} as const
