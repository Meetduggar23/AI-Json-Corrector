import { Play, Loader2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface RunButtonProps {
  onClick: () => void
  running?: boolean
  disabled?: boolean
  className?: string
}

export function RunButton({ onClick, running = false, disabled = false, className }: RunButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || running}
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-lg transition-all',
        'bg-surface border border-border',
        'hover:bg-surface-hover hover:border-primary/30 hover:text-primary',
        'active:scale-95',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-border disabled:hover:text-text-secondary',
        running ? 'text-primary border-primary/30 bg-primary/5' : 'text-text-secondary',
        className
      )}
      title="Run (Ctrl+Enter)"
      aria-label="Run"
    >
      {running ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Play size={16} fill="currentColor" strokeWidth={0} />
      )}
    </button>
  )
}
