import { useState } from 'react'
import { DiffViewer } from '@/components/diff/DiffViewer'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { Button } from '@/components/common/Button'
import { GitCompare, ArrowLeftRight } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import toast from 'react-hot-toast'

export default function DiffPage() {
  const content = useEditorStore((s) => s.content)
  const originalContent = useEditorStore((s) => s.originalContent)
  const [useOriginal, setUseOriginal] = useState(true)

  const left = useOriginal ? originalContent : content
  const right = useOriginal ? content : originalContent
  const hasOriginal = Boolean(originalContent)

  const handleSwap = () => {
    if (!hasOriginal) {
      toast.error('No original content saved. Try repairing first.')
      return
    }
    setUseOriginal(!useOriginal)
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center justify-between px-3 border-b border-border bg-toolbar/50 shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare size={14} className="text-accent" />
          <span className="text-xs font-medium text-text-primary">Diff Viewer</span>
          <span className="text-xs text-text-muted">— Compare original and corrected JSON</span>
        </div>
        <Button variant="ghost" size="xs" icon={<ArrowLeftRight size={13} />} onClick={handleSwap}>
          Swap
        </Button>
      </div>
      <div className="flex-1">
        {!originalContent || originalContent === content ? (
          <div className="flex items-center justify-center h-full text-xs text-text-muted">
            <div className="text-center">
              <GitCompare size={28} className="mx-auto mb-2 opacity-40" />
              <p>No changes to compare</p>
              <p className="mt-1">Edit the JSON or use Repair to create a diff</p>
            </div>
          </div>
        ) : (
          <DiffViewer original={left} corrected={right} />
        )}
      </div>
    </div>
  )
}
