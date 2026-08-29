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
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-text-secondary border border-border hover:bg-border hover:text-text',
  ghost: 'text-text-secondary hover:text-text hover:bg-border/40',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  success: 'bg-success/10 text-success hover:bg-success/20',
  warning: 'bg-warning/10 text-warning hover:bg-warning/20',
}

const sizeStyles: Record<string, string> = {
  xs: 'h-8 px-2 text-xs gap-1.5',
  sm: 'h-9 px-3 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'xs', icon, active, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded font-medium whitespace-nowrap',
        'transition-colors duration-150 focus:outline-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active && 'bg-primary/10 text-primary',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="size-4 shrink-0">{icon}</span>}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
