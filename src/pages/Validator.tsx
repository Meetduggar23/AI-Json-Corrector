import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { FileCheck } from 'lucide-react'

export default function ValidatorPage() {
  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center gap-2 px-3 border-b border-border bg-topbar-bg/50 shrink-0">
        <FileCheck size={14} className="text-primary" />
        <span className="text-xs font-medium text-text">Validator</span>
        <span className="text-xs text-text-muted">— Check JSON syntax and structure</span>
      </div>
      <div className="flex-1">
        <MonacoEditor />
      </div>
    </div>
  )
}
