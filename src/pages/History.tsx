import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { DocumentTabs } from '@/components/editor/DocumentTabs'
import { HistoryPanel } from '@/components/history/HistoryPanel'

export default function HistoryPage() {
  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <DocumentTabs />
      <div className="flex-1 flex">
        <div className="flex-1">
          <MonacoEditor />
        </div>
        <div className="w-72 border-l border-border bg-panel overflow-y-auto">
          <HistoryPanel />
        </div>
      </div>
    </div>
  )
}
