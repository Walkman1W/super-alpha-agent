'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: TooltipPosition
  className?: string
  contentClassName?: string
  delay?: number
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 border-y-transparent border-l-transparent',
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
  contentClassName,
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [adjustedPosition, setAdjustedPosition] = React.useState(position)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const showTooltip = React.useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }, [delay])

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVisible(false)
  }, [])

  // 视口边界检测
  React.useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newPosition = position

      // 检测是否溢出并调整位置
      if (position === 'top' && tooltipRect.top < 0) {
        newPosition = 'bottom'
      } else if (position === 'bottom' && tooltipRect.bottom > viewportHeight) {
        newPosition = 'top'
      } else if (position === 'left' && tooltipRect.left < 0) {
        newPosition = 'right'
      } else if (position === 'right' && tooltipRect.right > viewportWidth) {
        newPosition = 'left'
      }

      // 水平溢出检测 (top/bottom 位置)
      if ((position === 'top' || position === 'bottom') && 
          (tooltipRect.left < 0 || tooltipRect.right > viewportWidth)) {
        // 保持位置但可能需要调整对齐
      }

      if (newPosition !== adjustedPosition) {
        setAdjustedPosition(newPosition)
      }
    }
  }, [isVisible, position, adjustedPosition])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-xs font-medium',
            'bg-zinc-800 text-zinc-100 rounded-md shadow-lg',
            'whitespace-normal max-w-xs',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            'font-terminal',
            positionStyles[adjustedPosition],
            contentClassName
          )}
        >
          {content}
          {/* Arrow */}
          <span
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowStyles[adjustedPosition]
            )}
          />
        </div>
      )}
    </div>
  )
}

export default Tooltip
