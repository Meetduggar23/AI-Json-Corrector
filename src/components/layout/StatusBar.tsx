import { useMemo } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'

export function StatusBar() {
  const { content, validationErrors, fileName, statistics, isRunning } = useEditorStore()
  const { tabSize } = useSettingsStore()

  const stats = useMemo(() => ({
    lines: content ? content.split('\n').length : 0,
    chars: content.length,
    size: new Blob([content]).size,
  }), [content])

  const hasErrors = validationErrors.length > 0
  const hasContent = content.trim().length > 0

  return (
    <div className="h-[26px] bg-statusbar-bg border-t border-border flex items-center justify-between px-3 shrink-0 select-none text-[10.5px]">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          {isRunning ? (
            <span className="w-1.5 h-1.5 bg-warning animate-pulse shadow-sm shadow-warning/50" />
          ) : (
            <span className={`w-1.5 h-1.5 ${
              !hasContent ? 'bg-text-muted' : hasErrors ? 'bg-danger shadow-sm shadow-danger/50' : 'bg-success shadow-sm shadow-success/50'
            }`} />
          )}
          <span className="text-text-secondary">{isRunning ? 'Running...' : !hasContent ? 'No content' : hasErrors ? `${validationErrors.length} Error(s)` : 'Valid'}</span>
        </span>
        <span className="text-border">·</span>
        <span className="text-text-muted truncate max-w-[160px]">{fileName || 'untitled'}</span>
      </div>
      <div className="flex items-center gap-3 text-text-muted">
        {statistics && <><span>{statistics.keys} keys</span><span className="text-border">·</span></>}
        <span>Ln {stats.lines}</span>
        <span className="text-border">·</span>
        <span>Spaces {tabSize}</span>
        <span className="text-border">·</span>
        <span>UTF-8</span>
        <span className="text-border">·</span>
        <span>LF</span>
        <span className="text-border">·</span>
        <span>JSON</span>
        <span className="text-border">·</span>
        <span className="text-[9px] font-mono bg-surface px-1 py-0.5 border border-border">{'{ }'}</span>
      </div>
    </div>
  )
}
