import { useRef, useEffect } from 'react'
import { XCircle, CheckCircle, Terminal, Info, Clock, FileSearch } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/utils/helpers'
import { revealPosition, getEditorApi } from '@/utils/editorApi'
import type { ConsoleEntry } from '@/types/editor'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'problems' as const, label: 'Problems', icon: XCircle },
  { id: 'output' as const, label: 'Output', icon: Terminal },
  { id: 'logs' as const, label: 'Logs', icon: Info },
  { id: 'history' as const, label: 'History', icon: Clock },
  { id: 'schema' as const, label: 'Schema', icon: FileSearch },
]

const typeStyles = {
  info: { color: 'text-text-secondary', icon: 'i' },
  success: { color: 'text-success', icon: '✓' },
  warning: { color: 'text-warning', icon: '⚠' },
  error: { color: 'text-danger', icon: '✕' },
}

export function BottomPanel() {
  const { bottomTab, setBottomTab, consoleEntries, validationErrors, clearConsole } = useEditorStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [consoleEntries, bottomTab])

  return (
    <div className="h-full bg-panel flex flex-col">
      <div className="flex items-center h-[32px] px-2 shrink-0 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = bottomTab === tab.id
          const count = tab.id === 'problems' ? validationErrors.length : 0
          return (
            <button
              key={tab.id}
              onClick={() => setBottomTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={cn(
                'flex items-center gap-1.5 h-full px-3 text-[11.5px] transition-colors relative font-medium',
                isActive ? 'text-text' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Icon size={12} strokeWidth={1.75} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="min-w-[16px] h-[16px] bg-danger/15 text-danger text-[9px] flex items-center justify-center font-semibold px-1">
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary" />
              )}
            </button>
          )
        })}
        <div className="flex-1" />
        <button
          onClick={clearConsole}
          className="text-[10px] text-text-muted hover:text-text-secondary px-2 h-full transition-colors"
        >
          Clear
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px]">
        {bottomTab === 'problems' && <ProblemsTab errors={validationErrors} />}
        {bottomTab === 'output' && <OutputTab />}
        {bottomTab === 'logs' && <LogsTab entries={consoleEntries} />}
        {bottomTab === 'history' && <HistoryTab />}
        {bottomTab === 'schema' && <SchemaTab />}
      </div>
    </div>
  )
}

function ProblemsTab({ errors }: { errors: { line: number; column: number; message: string; type?: string; suggestion?: string }[] }) {
  if (errors.length === 0) return (
    <div className="flex flex-col items-center justify-center py-8">
      <CheckCircle size={32} className="text-success mb-2" strokeWidth={1.5} />
      <p className="text-[13px] font-medium text-text mb-1">No problems found</p>
      <p className="text-[11px] text-text-muted">Your JSON is valid and well-formed.</p>
    </div>
  )
  return (
    <div className="space-y-0">
      {errors.map((err, i) => (
        <button
          key={i}
          onClick={() => {
            const { editor } = getEditorApi()
            if (!editor) { toast.error('Editor not available'); return }
            revealPosition(err.line, err.column)
          }}
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-surface-hover w-full text-left transition-colors"
        >
          <XCircle size={12} className="text-danger shrink-0" strokeWidth={2} />
          <span className="text-text flex-1 truncate">{err.message}</span>
          <span className="text-text-muted shrink-0 font-mono text-[10px]">L{err.line}:{err.column}</span>
        </button>
      ))}
    </div>
  )
}

function OutputTab() {
  return (
    <div className="py-1 space-y-1">
      <div className="flex items-center gap-1.5 text-success">
        <CheckCircle size={12} strokeWidth={2} />
        <span className="text-[11.5px] font-medium">Validation completed</span>
      </div>
      <div className="text-text-muted text-[10px]">
        Ready
      </div>
    </div>
  )
}

function LogsTab({ entries }: { entries: ConsoleEntry[] }) {
  if (entries.length === 0) return <div className="text-text-muted italic py-2 text-[11px]">No logs.</div>
  return (
    <div className="space-y-0">
      {entries.slice(-30).map((e) => {
        const s = typeStyles[e.type]
        return (
          <div key={e.id} className="flex items-center gap-2 py-0.5 px-2 hover:bg-surface-hover transition-colors">
            <span className={cn('shrink-0 text-[10px]', s.color)}>{s.icon}</span>
            <span className="text-text flex-1 truncate">{e.message}</span>
            <span className="text-text-muted shrink-0 text-[9px]">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        )
      })}
    </div>
  )
}

function HistoryTab() {
  const { runHistory } = useEditorStore()
  if (runHistory.length === 0) return <div className="text-text-muted italic py-2 text-[11px]">No history.</div>
  return (
    <div className="space-y-0">
      {runHistory.slice(0, 15).map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-1 px-2 hover:bg-surface-hover transition-colors">
          <div className="flex items-center gap-2">
            {entry.success ? (
              <CheckCircle size={11} className="text-success shrink-0" strokeWidth={2} />
            ) : (
              <XCircle size={11} className="text-danger shrink-0" strokeWidth={2} />
            )}
            <span className="text-text text-[11px] truncate">{entry.fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[10px]">{entry.duration}ms</span>
            <span className="text-text-muted text-[10px]">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SchemaTab() {
  const { content, validationErrors } = useEditorStore()
  if (!content.trim()) return <div className="text-text-muted text-[11px] py-2">No content loaded.</div>
  return (
    <div className="py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-[11px]">Content</span>
        <span className="text-success text-[11px] font-medium">Loaded</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-[11px]">Validity</span>
        <span className={cn(
          'text-[11px] font-medium',
          validationErrors.length > 0 ? 'text-danger' : 'text-success'
        )}>
          {validationErrors.length > 0 ? `${validationErrors.length} error(s)` : 'Valid'}
        </span>
      </div>
      <p className="text-text-muted text-[10px]">Use Schema page for JSON Schema validation.</p>
    </div>
  )
}
