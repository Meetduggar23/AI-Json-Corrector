import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { QuickFix } from '@/components/repair/QuickFix'
import { Button } from '@/components/common/Button'
import { Wrench } from 'lucide-react'
import { useRepair } from '@/hooks/useRepair'
import { useEditorStore } from '@/store/editorStore'
import toast from 'react-hot-toast'

export default function RepairPage() {
  const content = useEditorStore((s) => s.content)
  const { repair } = useRepair()

  const handleAutoRepair = () => {
    const result = repair(content, true)
    if (result.success) {
      toast.success(result.corrected !== content ? 'JSON auto-repaired!' : 'JSON is already valid')
    } else {
      toast.error('Auto-repair failed')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <div className="h-9 flex items-center gap-2 px-3 border-b border-border bg-topbar-bg/50 shrink-0">
        <Wrench size={14} className="text-primary" />
        <span className="text-xs font-medium text-text">Repair</span>
        <span className="text-xs text-text-muted">— Fix common JSON errors automatically</span>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <MonacoEditor />
          </div>
        </div>
        <div className="w-[240px] border-l border-border bg-bg flex flex-col">
          <div className="h-8 flex items-center px-3 border-b border-border shrink-0">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Quick Fixes</span>
          </div>
          <QuickFix />
          <div className="p-3 border-t border-border mt-auto">
            <Button className="w-full" variant="primary" size="sm" icon={<Wrench size={14} />} onClick={handleAutoRepair}>
              Auto Repair
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
