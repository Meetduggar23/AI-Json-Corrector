import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { formatBytes } from '@/utils/helpers'

export function StatusBar() {
  const { content, validationErrors, fileName } = useEditorStore()
  const { tabSize } = useSettingsStore()
  const lines = content ? content.split('\n').length : 0
  const chars = content.length
  const size = new Blob([content]).size

  return (
    <div className="h-6 bg-toolbar border-t border-border flex items-center justify-between px-4 shrink-0 select-none" style={{ fontSize: '11px' }}>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${validationErrors.length === 0 ? 'bg-success' : 'bg-danger'}`} />
          <span className="text-text-secondary">{validationErrors.length === 0 ? 'Valid' : `${validationErrors.length} issue(s)`}</span>
        </span>
        <span className="text-border">|</span>
        <span className="text-text-muted truncate" style={{ maxWidth: '200px' }}>{fileName || 'untitled'}</span>
      </div>
      <div className="flex items-center gap-3 text-text-muted">
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
