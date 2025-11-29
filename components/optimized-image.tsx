/**
 * 优化的图片组件
 * 使用 Next.js Image 组件实现图片优化、懒加载和 blur placeholder
 * 需求: 9.2
 */

'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  generateBlurDataURL,
  generatePlaceholderImage,
  isValidImageUrl,
  IMAGE_SIZES,
  RESPONSIVE_IMAGE_SIZES,
} from '@/lib/image-utils'

export interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  /** 图片 URL */
  src: string | null | undefined
  /** 替代文本（必需，用于可访问性） */
  alt: string
  /** 占位符文本（当没有图片时显示） */
  placeholderText?: string
  /** 图片尺寸预设 */
  sizePreset?: keyof typeof IMAGE_SIZES
  /** 是否显示加载状态 */
  showLoadingState?: boolean
  /** 容器类名 */
  containerClassName?: string
  /** 错误时的回退内容 */
  fallback?: React.ReactNode
}

/**
 * OptimizedImage 组件
 * 
 * 特性:
 * - 自动使用 Next.js Image 组件进行优化
 * - 懒加载（loading="lazy"）
 * - Blur placeholder
 * - 错误处理和回退
 * - 响应式尺寸
 * - 无效 URL 处理
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src={agent.logo_url}
 *   alt={agent.name}
 *   placeholderText={agent.name}
 *   sizePreset="medium"
 *   priority={false}
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  placeholderText,
  sizePreset = 'medium',
  showLoadingState = true,
  containerClassName,
  fallback,
  className,
  priority = false,
  loading,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 验证图片 URL
  const isValid = isValidImageUrl(src)
  const shouldShowPlaceholder = !isValid || hasError

  // 获取尺寸配置
  const size = IMAGE_SIZES[sizePreset]
  const responsiveSizes = RESPONSIVE_IMAGE_SIZES[sizePreset]

  // 生成 blur placeholder
  const blurDataURL = generateBlurDataURL(size.width, size.height)

  // 处理图片加载完成
  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // 处理图片加载错误
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  // 如果需要显示占位符
  if (shouldShowPlaceholder) {
    if (fallback) {
      return <>{fallback}</>
    }

    const placeholderSrc = generatePlaceholderImage(
      placeholderText || alt || '?',
      size.width,
      size.height
    )

    return (
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100',
          containerClassName
        )}
        style={{
          width: size.width,
          height: size.height,
        }}
      >
        <Image
          src={placeholderSrc}
          alt={alt}
          width={size.width}
          height={size.height}
          className={cn('object-cover', className)}
          {...props}
        />
      </div>
    )
  }

  return (
    <div
      className={cn('relative overflow-hidden', containerClassName)}
      style={{
        width: size.width,
        height: size.height,
      }}
    >
      {/* 加载状态 */}
      {showLoadingState && isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 animate-pulse"
          aria-label="图片加载中"
        />
      )}

      {/* 优化的图片 */}
      <Image
        src={src!}
        alt={alt}
        width={size.width}
        height={size.height}
        sizes={responsiveSizes}
        placeholder="blur"
        blurDataURL={blurDataURL}
        loading={loading || (priority ? undefined : 'lazy')}
        priority={priority}
        onLoad={handleLoadingComplete}
        onError={handleError}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * AgentLogo 组件
 * 专门用于显示 Agent logo 的优化组件
 */
export function AgentLogo({
  src,
  name,
  size = 'medium',
  className,
  ...props
}: {
  src: string | null | undefined
  name: string
  size?: keyof typeof IMAGE_SIZES
  className?: string
} & Partial<OptimizedImageProps>) {
  return (
    <OptimizedImage
      src={src}
      alt={`${name} logo`}
      placeholderText={name}
      sizePreset={size}
      containerClassName={cn('rounded-lg', className)}
      {...props}
    />
  )
}

/**
 * HeroImage 组件
 * 专门用于 hero section 的优化图片组件
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: {
  src: string
  alt: string
  className?: string
} & Partial<OptimizedImageProps>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      sizePreset="hero"
      priority={true}
      containerClassName={cn('w-full h-auto', className)}
      {...props}
    />
  )
}

export default OptimizedImage
