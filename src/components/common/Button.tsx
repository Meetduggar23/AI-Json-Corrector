import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm'
  icon?: ReactNode
  active?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/15',
  secondary: 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text',
  ghost: 'text-text-secondary hover:text-text hover:bg-surface-hover',
  danger: 'bg-danger/10 text-danger hover:bg-danger/15',
  success: 'bg-success/10 text-success hover:bg-success/15',
  warning: 'bg-warning/10 text-warning hover:bg-warning/15',
}

const sizeStyles: Record<string, string> = {
  xs: 'h-8 px-2.5 text-[11px] gap-1.5',
  sm: 'h-9 px-3.5 text-[12px] gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'xs', icon, active, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap',
        'transition-colors duration-150 focus:outline-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active && 'bg-primary/10 text-primary',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="size-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
