import { useRef, useEffect } from 'react'
import {
  XCircle, CheckCircle, Terminal, Info, Clock, FileSearch,
} from 'lucide-react'
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
  info: { color: 'text-text-secondary', icon: 'ℹ' },
  success: { color: 'text-success', icon: '✓' },
  warning: { color: 'text-warning', icon: '⚠' },
  error: { color: 'text-danger', icon: '✕' },
}

export function BottomPanel() {
  const { bottomTab, setBottomTab, consoleEntries, validationErrors, clearConsole } = useEditorStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [consoleEntries, bottomTab])

  return (
    <div className="h-full bg-panel-bg flex flex-col">
      <div className="flex items-center h-8 px-3 shrink-0 border-b border-border gap-0">
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
                'flex items-center gap-1.5 h-full px-2.5 text-[12px] transition-colors relative',
                isActive
                  ? 'text-text font-medium'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="min-w-[16px] h-[16px] rounded-full bg-danger text-white text-[9px] flex items-center justify-center font-semibold px-1">
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          )
        })}
        <div className="flex-1" />
        <button
          onClick={clearConsole}
          className="text-[11px] text-text-muted hover:text-text transition-colors px-2 h-full"
        >
          Clear
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px]">
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
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-6">
        <CheckCircle size={20} className="text-success mb-2" />
        <p className="text-text text-[13px] font-medium">No problems detected</p>
        <p className="text-text-muted text-[12px] mt-0.5">Your JSON is valid and well-formed.</p>
      </div>
    )
  }
  return (
    <div className="space-y-0.5">
      {errors.map((err, i) => (
        <button
          key={i}
          onClick={() => {
            const { editor } = getEditorApi()
            if (!editor) { toast.error('Editor not available'); return }
            revealPosition(err.line, err.column)
          }}
          className="flex items-start gap-2 py-1 px-2 rounded hover:bg-surface-hover w-full text-left transition-colors"
        >
          <XCircle size={13} className="text-danger shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-text text-[12px]">{err.message}</span>
              {err.type && (
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium shrink-0">{err.type}</span>
              )}
            </div>
            {err.suggestion && (
              <p className="text-text-muted text-[10px] mt-0.5">Suggestion: {err.suggestion}</p>
            )}
          </div>
          <span className="text-text-muted shrink-0 text-[10px] font-mono">L{err.line}:{err.column}</span>
        </button>
      ))}
    </div>
  )
}

function OutputTab() {
  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center gap-2 text-success">
        <CheckCircle size={13} />
        <span className="text-[13px]">JSON Corrector ready</span>
      </div>
      <p className="text-text-muted text-[11px] pl-5">All features operate offline. No data is sent to any server.</p>
    </div>
  )
}

function LogsTab({ entries }: { entries: ConsoleEntry[] }) {
  if (entries.length === 0) {
    return <div className="text-text-muted italic text-[11px] py-2">No log entries yet.</div>
  }
  return (
    <div className="space-y-0.5">
      {entries.slice(-50).map((entry) => {
        const style = typeStyles[entry.type]
        return (
          <div key={entry.id} className="flex items-start gap-2 py-0.5 px-1 rounded hover:bg-surface-hover">
            <span className={cn('text-xs shrink-0 mt-0.5', style.color)}>{style.icon}</span>
            <span className="text-text flex-1">{entry.message}</span>
            <span className="text-text-muted shrink-0 text-[10px]">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function HistoryTab() {
  const { history, setContent } = useEditorStore()
  if (history.length === 0) {
    return <div className="text-text-muted italic text-[11px] py-2">No history yet.</div>
  }
  return (
    <div className="space-y-0.5">
      {history.slice(-20).reverse().map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-surface-hover">
          <div className="min-w-0 flex-1">
            <span className="text-text text-[12px]">{entry.label}</span>
            <span className="text-text-muted ml-2 text-[10px]">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button
            onClick={() => setContent(entry.content)}
            className="text-[10px] text-primary hover:text-primary-hover shrink-0 ml-2 font-medium"
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  )
}

function SchemaTab() {
  const { content, validationErrors } = useEditorStore()
  const hasContent = content.trim().length > 0
  const hasErrors = validationErrors.length > 0

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-6">
        <FileSearch size={20} className="text-text-muted/40 mb-2" />
        <p className="text-text-secondary text-[13px] font-medium">No content loaded</p>
        <p className="text-text-muted text-[12px] mt-0.5">Open a file to view schema validation status.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">JSON Schema</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between py-1 px-2 rounded">
          <span className="text-text-secondary text-[12px]">Content Loaded</span>
          <span className="text-success text-[12px] font-medium">✓ Yes</span>
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded">
          <span className="text-text-secondary text-[12px]">JSON Validity</span>
          <span className={hasErrors ? 'text-danger text-[12px] font-medium' : 'text-success text-[12px] font-medium'}>
            {hasErrors ? `✗ ${validationErrors.length} error(s)` : '✓ Valid'}
          </span>
        </div>
      </div>
      <p className="text-text-muted text-[11px] mt-2">
        Use the Schema page to validate against a JSON Schema.
      </p>
    </div>
  )
}
