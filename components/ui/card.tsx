import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Define CardProps interface
export interface CardProps {
  children: ReactNode
  className?: string
}

// Define CardHeaderProps interface
export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

// Define CardContentProps interface
export interface CardContentProps {
  children: ReactNode
  className?: string
}

// Define CardFooterProps interface
export interface CardFooterProps {
  children: ReactNode
  className?: string
}

// Card component implementation
export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      {children}
    </div>
  )
}

// CardHeader component implementation
export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  )
}

// CardContent component implementation
export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
}

// CardFooter component implementation
export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  )
}
