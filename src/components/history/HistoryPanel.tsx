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
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <span className="text-[11px] font-semibold text-text-secondary">History</span>
        <Button variant="ghost" size="xs" icon={<Trash2 size={12} />} onClick={clearHistory}>
          Clear
        </Button>
      </div>
      {history.length === 0 ? (
        <div className="text-text-muted text-xs text-center py-6">
          <Clock size={16} className="mx-auto mb-1 opacity-40" />
          No history yet
        </div>
      ) : (
        <div className="divide-y divide-border">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-2 py-1.5 hover:bg-border/15 cursor-pointer transition-colors"
              onClick={() => restore(index)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-primary truncate">{entry.label}</p>
                <p className="text-[10px] text-text-muted">{dayjs(entry.timestamp).fromNow()}</p>
              </div>
              {index === historyIndex && (
                <span className="text-[10px] text-accent font-medium ml-2 shrink-0">Current</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
