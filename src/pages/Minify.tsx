import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { DocumentTabs } from '@/components/editor/DocumentTabs'

export default function MinifyPage() {

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <DocumentTabs />
      <div className="flex-1">
        <MonacoEditor />
      </div>
    </div>
  )
}
