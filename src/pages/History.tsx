import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { Clock } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center gap-2 px-3 border-b border-border bg-topbar-bg/50 shrink-0">
        <Clock size={14} className="text-primary" />
        <span className="text-xs font-medium text-text">History</span>
        <span className="text-xs text-text-muted">— View and restore previous versions</span>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1">
          <MonacoEditor />
        </div>
        <div className="w-72 border-l border-border bg-surface overflow-y-auto">
          <HistoryPanel />
        </div>
      </div>
    </div>
  )
}
