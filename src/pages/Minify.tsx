import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { Button } from '@/components/common/Button'
import { Shrink } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { minifyJson, isValidJson } from '@/services/formatter'
import { generateId } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'
import toast from 'react-hot-toast'

export default function MinifyPage() {
  const content = useEditorStore((s) => s.content)
  const setContent = useEditorStore((s) => s.setContent)
  const pushHistory = useEditorStore((s) => s.pushHistory)

  const handleMinify = () => {
    const minified = minifyJson(content)
    if (minified !== content) {
      setContent(minified)
      pushHistory({ id: generateId(), content: minified, timestamp: Date.now(), label: 'Minify' })
      trackActivity({ type: 'minify', label: 'Minified JSON', path: '/minify' })
      toast.success('JSON minified')
    } else if (isValidJson(content)) {
      toast.error('JSON is already minified')
    } else {
      toast.error('Could not minify - invalid JSON')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center justify-between px-3 border-b border-border bg-toolbar/50">
        <span className="text-xs text-text-secondary">Compress JSON — removes all whitespace</span>
        <Button size="xs" icon={<Shrink size={13} />} onClick={handleMinify}>Minify</Button>
      </div>
      <div className="flex-1">
        <MonacoEditor />
      </div>
    </div>
  )
}
