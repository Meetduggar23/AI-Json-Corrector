import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { formatBytes } from '@/utils/helpers'

export function StatusBar() {
  const { content, validationErrors, fileName, statistics, isRunning } = useEditorStore()
  const { tabSize } = useSettingsStore()
  const lines = content ? content.split('\n').length : 0
  const chars = content.length
  const size = new Blob([content]).size
  const hasErrors = validationErrors.length > 0
  const hasContent = content.trim().length > 0

  return (
    <div className="h-6 bg-toolbar border-t border-border flex items-center justify-between px-4 shrink-0 select-none" style={{ fontSize: '11px' }}>
      <div className="flex items-center gap-3">
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
        <span className="text-border">|</span>
        <span className="text-text-muted truncate" style={{ maxWidth: '200px' }}>{fileName || 'untitled'}</span>
      </div>
      <div className="flex items-center gap-3 text-text-muted">
        {statistics && (
          <>
            <span>{statistics.keys} keys</span>
            <span className="text-border">|</span>
          </>
        )}
        <span>Ln {lines}</span>
        <span className="text-border">|</span>
        <span>{chars.toLocaleString()} chars</span>
        <span className="text-border">|</span>
        <span>{formatBytes(size)}</span>
        <span className="text-border">|</span>
        <span>Spaces: {tabSize}</span>
      </div>
    </div>
  )
}
