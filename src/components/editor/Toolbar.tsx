import { useCallback } from 'react'
import {
  Undo2, Redo2, Sparkles, Wrench, Shrink, Search, GitCompare, Copy, Download,
} from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useRepair } from '@/hooks/useRepair'
import { useSettingsStore } from '@/store/editorStore'
import { beautifyJson, minifyJson } from '@/services/formatter'
import { validateJson } from '@/services/validator'
import { computeStatistics } from '@/utils/statistics'
import { generateId } from '@/utils/helpers'
import { downloadJson } from '@/utils/download'
import toast from 'react-hot-toast'

export function EditorToolbar() {
  const { content, setContent, fileName, pushHistory, undo, redo, historyIndex, history, setValidationErrors, setStatistics } = useEditorStore()
  const { tabSize, indentStyle } = useSettingsStore()
  const { repair } = useRepair()

  const handleFormat = () => {
    const indent = indentStyle === 'tab' ? 'tab' as const : tabSize as 2 | 4 | 8
    const formatted = beautifyJson(content, indent)
    if (formatted !== content) {
      setContent(formatted)
      pushHistory({ id: generateId(), content: formatted, timestamp: Date.now(), label: 'Format' })
      toast.success('Formatted')
    }
  }

  const handleMinify = () => {
    const minified = minifyJson(content)
    if (minified !== content) {
      setContent(minified)
      pushHistory({ id: generateId(), content: minified, timestamp: Date.now(), label: 'Minify' })
      toast.success('Minified')
    }
  }

  const handleRepair = useCallback(() => {
    const r = repair(content, false)
    const validationResult = validateJson(r.corrected)
    setValidationErrors(validationResult.errors)
    if (validationResult.valid) {
      setStatistics(computeStatistics(r.corrected))
    }
    if (r.success) {
      toast.success('JSON repaired successfully')
    } else {
      toast.error('Repair failed - could not fix JSON')
    }
  }, [content, repair, setValidationErrors, setStatistics])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    toast.success('Copied')
  }

  const handleDownload = () => {
    if (!content.trim()) { toast.error('Nothing to download'); return }
    downloadJson(content, fileName || 'untitled.json')
    toast.success('Downloaded')
  }

  return (
    <div className="h-[30px] flex items-center gap-0.5 px-2 border-b border-border bg-editor-bg shrink-0">
      <EditorBtn icon={Undo2} onClick={undo} disabled={historyIndex <= 0} label="Undo" />
      <EditorBtn icon={Redo2} onClick={redo} disabled={historyIndex >= history.length - 1} label="Redo" />
      <span className="w-px h-3.5 bg-border mx-1" />
      <EditorBtn icon={Sparkles} onClick={handleFormat} label="Format" />
      <EditorBtn icon={Wrench} onClick={handleRepair} label="Repair" />
      <EditorBtn icon={Shrink} onClick={handleMinify} label="Minify" />
      <span className="w-px h-3.5 bg-border mx-1" />
      <EditorBtn icon={Search} onClick={() => window.dispatchEvent(new CustomEvent('editor:search'))} label="Search" />
      <EditorBtn icon={GitCompare} onClick={() => window.location.href = '/diff'} label="Diff" />
      <span className="w-px h-3.5 bg-border mx-1" />
      <EditorBtn icon={Copy} onClick={handleCopy} label="Copy" />
      <EditorBtn icon={Download} onClick={handleDownload} label="Download" />
    </div>
  )
}

function EditorBtn({ icon: Icon, onClick, disabled, label }: {
  icon: typeof Undo2
  onClick?: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 h-7 px-2 text-[11px] text-text-secondary hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      title={label}
    >
      <Icon size={14} strokeWidth={1.75} />
    </button>
  )
}
