import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { FileJson } from 'lucide-react'

export function Workspace() {
  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center gap-2 px-3 border-b border-border bg-toolbar/50 shrink-0">
        <FileJson size={14} className="text-accent" />
        <span className="text-xs font-medium text-text-primary">Workspace</span>
        <span className="text-xs text-text-muted">— Edit your JSON directly</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <MonacoEditor />
      </div>
    </div>
  )
}
