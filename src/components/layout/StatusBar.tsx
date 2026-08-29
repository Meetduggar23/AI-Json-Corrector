import { useMemo } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { formatBytes } from '@/utils/helpers'

export function StatusBar() {
  const { content, validationErrors, fileName, statistics, isRunning } = useEditorStore()
  const { tabSize } = useSettingsStore()

  const stats = useMemo(() => {
    const lines = content ? content.split('\n').length : 0
    const chars = content.length
    const size = new Blob([content]).size
    return { lines, chars, size }
  }, [content])

  const hasErrors = validationErrors.length > 0
  const hasContent = content.trim().length > 0

  return (
    <div className="h-6 bg-statusbar-bg border-t border-border flex items-center justify-between px-3 shrink-0 select-none text-[11px]">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          {isRunning ? (
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full ${!hasContent ? 'bg-text-muted' : hasErrors ? 'bg-danger' : 'bg-success'}`} />
          )}
          <span className="text-text-secondary">
            {isRunning ? 'Running...' : !hasContent ? 'No content' : hasErrors ? `${validationErrors.length} error(s)` : 'Valid'}
          </span>
        </span>
        <span className="text-border-strong">|</span>
        <span className="text-text-muted truncate max-w-[200px]">{fileName || 'untitled'}</span>
      </div>
      <div className="flex items-center gap-2 text-text-muted">
        {statistics && (
          <>
            <span>{statistics.keys} keys</span>
            <span className="text-border-strong">|</span>
          </>
        )}
        <span>Ln {stats.lines}</span>
        <span className="text-border-strong">|</span>
        <span>{stats.chars.toLocaleString()} chars</span>
        <span className="text-border-strong">|</span>
        <span>{formatBytes(stats.size)}</span>
        <span className="text-border-strong">|</span>
        <span>Spaces: {tabSize}</span>
      </div>
    </div>
  )
}
