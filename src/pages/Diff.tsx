import { DiffViewer } from '@/components/diff/DiffViewer'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { DocumentTabs } from '@/components/editor/DocumentTabs'
import { GitCompare } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'

export default function DiffPage() {
  const content = useEditorStore((s) => s.content)
  const originalContent = useEditorStore((s) => s.originalContent)

  const left = originalContent
  const right = content

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <DocumentTabs />
      <div className="flex-1">
        {!originalContent || originalContent === content ? (
          <div className="flex items-center justify-center h-full text-[12px] text-text-muted">
            <div className="text-center">
              <GitCompare size={32} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="font-medium">No changes to compare</p>
              <p className="mt-1 text-text-muted">Edit the JSON or use Repair to create a diff</p>
            </div>
          </div>
        ) : (
          <DiffViewer original={left} corrected={right} />
        )}
      </div>
    </div>
  )
}
