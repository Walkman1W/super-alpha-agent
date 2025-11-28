'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  // Base styles - ensuring minimum 44px height for touch target
  'flex w-full rounded-lg border bg-white px-4 py-3 text-base transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[88px] resize-y',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500',
        error:
          'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500',
        success:
          'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string
  label?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, label, helperText, id, ...props }, ref) => {
    const textareaId = id || React.useId()
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`
    
    const computedVariant = error ? 'error' : variant
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(textareaVariants({ variant: computedVariant, className }))}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
