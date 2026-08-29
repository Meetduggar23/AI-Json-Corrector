import { useMemo } from 'react'
import { computeDiff } from '@/services/diff'
import { cn } from '@/utils/helpers'

interface DiffViewerProps {
  original: string
  corrected: string
}

export function DiffViewer({ original, corrected }: DiffViewerProps) {
  const diff = useMemo(() => computeDiff(original, corrected), [original, corrected])

  return (
    <div className="flex h-full font-mono text-xs">
      <div className="flex-1 border-r border-border">
        <div className="px-3 py-1.5 bg-surface border-b border-border text-xs font-medium text-text-secondary">Original</div>
        <div className="overflow-auto h-[calc(100%-32px)] overflow-x-auto">
          {diff.left.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex px-3 py-0.5',
                line.type === 'removed' ? 'bg-diff-removed-bg text-diff-removed-text' : 'text-text'
              )}
            >
              <span className="w-8 text-text-muted text-right mr-3 shrink-0 select-none">{line.lineNumber}</span>
              <span className="whitespace-pre">{line.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="px-3 py-1.5 bg-surface border-b border-border text-xs font-medium text-text-secondary">Corrected</div>
        <div className="overflow-auto h-[calc(100%-32px)] overflow-x-auto">
          {diff.right.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex px-3 py-0.5',
                line.type === 'added' ? 'bg-diff-added-bg text-diff-added-text' : 'text-text'
              )}
            >
              <span className="w-8 text-text-muted text-right mr-3 shrink-0 select-none">{line.lineNumber}</span>
              <span className="whitespace-pre">{line.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
