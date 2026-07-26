import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { Button } from '@/components/common/Button'
import { Sparkles } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { beautifyJson, isValidJson } from '@/services/formatter'
import { generateId } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'
import toast from 'react-hot-toast'

export default function BeautifyPage() {
  const content = useEditorStore((s) => s.content)
  const setContent = useEditorStore((s) => s.setContent)
  const pushHistory = useEditorStore((s) => s.pushHistory)
  const { tabSize, indentStyle } = useSettingsStore()

  const handleBeautify = () => {
    const indent = indentStyle === 'tab' ? 'tab' as const : tabSize as 2 | 4 | 8
    const formatted = beautifyJson(content, indent)
    if (formatted !== content) {
      setContent(formatted)
      pushHistory({ id: generateId(), content: formatted, timestamp: Date.now(), label: 'Beautify' })
      trackActivity({ type: 'beautify', label: 'Beautified JSON', path: '/beautify' })
      toast.success('JSON beautified')
    } else if (isValidJson(content)) {
      toast.error('JSON is already formatted')
    } else {
      toast.error('Could not beautify - invalid JSON')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center justify-between px-3 border-b border-border bg-toolbar/50">
        <span className="text-xs text-text-secondary">Beautify with indentation</span>
        <Button size="xs" icon={<Sparkles size={13} />} onClick={handleBeautify}>Beautify</Button>
      </div>
      <div className="flex-1">
        <MonacoEditor />
      </div>
    </div>
  )
}
