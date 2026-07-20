import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-700',
        dark: 'border-transparent bg-ink-800 text-white',
        neutral: 'border-transparent bg-ink-100 text-ink-700',
        outline: 'border-ink-200 text-ink-700',
        success: 'border-transparent bg-success-50 text-success-600',
        warning: 'border-transparent bg-warning-50 text-warning-600',
        danger: 'border-transparent bg-danger-50 text-danger-600',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
