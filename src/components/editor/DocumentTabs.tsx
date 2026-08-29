import { X, Plus, FileJson } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/utils/helpers'

export function DocumentTabs() {
  const { fileName, setContent, setFileName, setStatistics, setValidationErrors, pushHistory, addConsoleEntry } = useEditorStore()

  const handleClose = () => {
    setContent('')
    setFileName('untitled.json')
    setStatistics(null)
    setValidationErrors([])
  }

  const handleNew = () => {
    setContent('{\n  \n}')
    setFileName('untitled.json')
    setStatistics(null)
    setValidationErrors([])
    pushHistory({ id: crypto.randomUUID(), content: '{\n  \n}', timestamp: Date.now(), label: 'New document' })
    addConsoleEntry({ id: crypto.randomUUID(), type: 'info', message: 'New document', timestamp: Date.now() })
  }

  return (
    <div className="flex items-center h-[32px] bg-editor-bg border-b border-border px-2 shrink-0">
      <div className="flex items-center gap-0">
        <div className={cn(
          'flex items-center gap-1.5 h-[28px] px-3 text-[11px] font-medium border-t border-x border-border bg-panel text-text',
        )}>
          <FileJson size={12} className="text-primary" strokeWidth={2} />
          <span>{fileName || 'untitled.json'}</span>
          <button
            onClick={handleClose}
            className="w-4 h-4 flex items-center justify-center hover:bg-surface-hover transition-colors ml-1"
          >
            <X size={10} className="text-text-muted" />
          </button>
        </div>
        <button
          onClick={handleNew}
          className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          title="New Tab"
        >
          <Plus size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
