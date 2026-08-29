import { useEffect, useCallback } from 'react'
import { Trash2, RotateCcw, XCircle, Clock, FileJson } from 'lucide-react'
import { useTrashStore, type TrashItem } from '@/store/trashStore'
import { useEditorStore } from '@/store/editorStore'
import { cn, formatBytes } from '@/utils/helpers'
import { computeStatistics } from '@/utils/statistics'
import { isValidJson } from '@/services/formatter'
import toast from 'react-hot-toast'

function daysRemaining(expiresAt: number): number {
  const diff = expiresAt - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export default function TrashPage() {
  const { items, restore, permanentDelete, emptyTrash, cleanup } = useTrashStore()
  const { setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry } = useEditorStore()

  useEffect(() => {
    cleanup()
  }, [cleanup])

  const handleRestore = useCallback((item: TrashItem) => {
    const restored = restore(item.id)
    if (restored) {
      setFileName(restored.name)
      setContent(restored.content)
      setStatistics(computeStatistics(restored.content))
      const valid = isValidJson(restored.content)
      setValidationErrors(valid ? [] : [{ line: 1, column: 1, message: 'Invalid JSON', type: 'syntax' as const }])
      addConsoleEntry({ id: crypto.randomUUID(), type: 'info', message: `Restored ${restored.name}`, timestamp: Date.now() })
      toast.success(`Restored ${restored.name}`)
    }
  }, [restore, setFileName, setContent, setStatistics, setValidationErrors, addConsoleEntry])

  const handlePermanentDelete = useCallback((item: TrashItem) => {
    permanentDelete(item.id)
    toast.success(`Permanently deleted ${item.name}`)
  }, [permanentDelete])

  const handleEmptyTrash = useCallback(() => {
    emptyTrash()
    toast.success('Trash emptied')
  }, [emptyTrash])

  return (
    <div className="h-full flex flex-col">
      <div className="h-[32px] flex items-center gap-2 px-4 border-b border-border bg-editor-bg shrink-0">
        <Trash2 size={13} className="text-danger" strokeWidth={2} />
        <span className="text-[11px] font-medium text-text">Trash</span>
        <span className="text-[11px] text-text-muted">—</span>
        <span className="text-[11px] text-text-muted">Deleted files are kept for 30 days</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[700px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[15px] font-bold text-text tracking-tight">Trash</h1>
              {items.length > 0 && (
                <span className="text-[11px] text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                  {items.length} file{items.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {items.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="h-7 px-3 rounded-lg bg-danger/10 text-danger text-[11px] font-medium hover:bg-danger/20 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                Empty Trash
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-text-muted/40" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-medium text-text-secondary mb-1">Trash is empty</p>
              <p className="text-[11px] text-text-muted">Deleted files will appear here and be kept for 30 days.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const days = daysRemaining(item.expiresAt)
                return (
                  <div
                    key={item.id}
                    className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 hover:border-border/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-danger/8 flex items-center justify-center shrink-0">
                      <FileJson size={16} className="text-danger/60" strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-text truncate">{item.name}</span>
                        <span className={cn(
                          'text-[9px] font-semibold px-1.5 py-0.5 rounded-full',
                          days <= 3 ? 'bg-danger/10 text-danger' : 'bg-surface border border-border text-text-muted'
                        )}>
                          {days}d left
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-text-muted">{formatBytes(item.size)}</span>
                        <span className="text-[10px] text-text-muted">Deleted {timeAgo(item.deletedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRestore(item)}
                        className="h-7 px-2.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
                        title="Restore file"
                      >
                        <RotateCcw size={12} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete permanently"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-center gap-1.5 pt-3 text-[10px] text-text-muted">
                <Clock size={10} />
                <span>Files are automatically deleted after 30 days</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
