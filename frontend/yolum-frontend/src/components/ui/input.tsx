import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leftIcon?: React.ReactNode
  rightSlot?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, leftIcon, rightSlot, ...props }, ref) => {
    if (leftIcon || rightSlot) {
      return (
        <div
          className={cn(
            'flex h-12 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 transition-colors focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100',
            invalid && 'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-100',
            props.disabled && 'cursor-not-allowed opacity-60',
            className
          )}
        >
          {leftIcon && <span className="shrink-0 text-ink-400">{leftIcon}</span>}
          <input
            type={type}
            className="h-full w-full flex-1 bg-transparent text-base text-ink-800 placeholder:text-ink-500 focus:outline-none"
            ref={ref}
            {...props}
          />
          {rightSlot && <span className="shrink-0">{rightSlot}</span>}
        </div>
      )
    }
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-md border border-ink-200 bg-white px-4 text-base text-ink-800 transition-colors placeholder:text-ink-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60',
          invalid && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
