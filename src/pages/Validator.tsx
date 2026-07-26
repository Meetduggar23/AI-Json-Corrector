import { useEditorStore } from '@/store/editorStore'
import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'

export default function ValidatorPage() {
  const content = useEditorStore((s) => s.content)

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="flex-1">
        <MonacoEditor />
      </div>
    </div>
  )
}
