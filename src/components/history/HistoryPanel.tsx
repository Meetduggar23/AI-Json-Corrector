import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Clock, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { Button } from '@/components/common/Button'

dayjs.extend(relativeTime)

export function HistoryPanel() {
  const { history, historyIndex, clearHistory, setContent, pushHistory } = useEditorStore()

  const restore = (index: number) => {
    const entry = history[index]
    if (entry) {
      setContent(entry.content)
      pushHistory({ id: entry.id, content: entry.content, timestamp: Date.now(), label: `Restored: ${entry.label}` })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-semibold text-text-secondary">History</span>
        <Button variant="ghost" size="xs" icon={<Trash2 size={12} />} onClick={clearHistory}>
          Clear
        </Button>
      </div>
      {history.length === 0 ? (
        <div className="text-text-muted text-[11px] text-center py-8">
          <Clock size={16} className="mx-auto mb-2 opacity-30" strokeWidth={1.5} />
          No history yet
        </div>
      ) : (
        <div className="divide-y divide-border">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover cursor-pointer transition-colors"
              onClick={() => restore(index)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-text truncate font-medium">{entry.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{dayjs(entry.timestamp).fromNow()}</p>
              </div>
              {index === historyIndex && (
                <span className="text-[10px] text-primary font-medium ml-2 shrink-0">Current</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
