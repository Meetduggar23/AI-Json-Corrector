import { useRef, useCallback } from 'react'
import {
  FolderOpen, Save, Undo2, Redo2, Sparkles, Wrench, Copy, Clipboard,
} from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useRepair } from '@/hooks/useRepair'
import { useSettingsStore } from '@/store/editorStore'
import { beautifyJson } from '@/services/formatter'
import { validateJson } from '@/services/validator'
import { computeStatistics } from '@/utils/statistics'
import { downloadJson } from '@/utils/download'
import { readFileAsText } from '@/utils/upload'
import { generateId } from '@/utils/helpers'
import toast from 'react-hot-toast'

export function EditorToolbar() {
  const { content, setContent, pushHistory, undo, redo, historyIndex, history, setFileName, setValidationErrors, setStatistics } = useEditorStore()
  const { tabSize, indentStyle } = useSettingsStore()
  const { repair } = useRepair()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpen = async () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      setContent(text)
      setFileName(file.name)
      pushHistory({ id: generateId(), content: text, timestamp: Date.now(), label: `Open: ${file.name}` })
      toast.success(`Loaded ${file.name}`)
    } catch {
      toast.error('Failed to read file')
    }
    e.target.value = ''
  }

  const handleSave = () => {
    downloadJson(content)
    toast.success('Downloaded')
  }

  const handleFormat = () => {
    const indent = indentStyle === 'tab' ? 'tab' as const : tabSize as 2 | 4 | 8
    const formatted = beautifyJson(content, indent)
    if (formatted !== content) {
      setContent(formatted)
      pushHistory({ id: generateId(), content: formatted, timestamp: Date.now(), label: 'Format' })
      toast.success('Formatted')
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

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    setContent(text)
    pushHistory({ id: generateId(), content: text, timestamp: Date.now(), label: 'Paste' })
    toast.success('Pasted')
  }

  return (
    <div className="h-8 flex items-center gap-0.5 px-2 border-b border-border bg-editor-bg shrink-0">
      <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />
      <EditorBtn icon={FolderOpen} onClick={handleOpen} label="Open" />
      <EditorBtn icon={Save} onClick={handleSave} label="Save" />
      <span className="w-px h-3.5 bg-border mx-0.5" />
      <EditorBtn icon={Undo2} onClick={undo} disabled={historyIndex <= 0} label="Undo" />
      <EditorBtn icon={Redo2} onClick={redo} disabled={historyIndex >= history.length - 1} label="Redo" />
      <span className="w-px h-3.5 bg-border mx-0.5" />
      <EditorBtn icon={Sparkles} onClick={handleFormat} label="Format" />
      <EditorBtn icon={Wrench} onClick={handleRepair} label="Repair" />
      <span className="w-px h-3.5 bg-border mx-0.5" />
      <EditorBtn icon={Copy} onClick={handleCopy} label="Copy" />
      <EditorBtn icon={Clipboard} onClick={handlePaste} label="Paste" />
    </div>
  )
}

function EditorBtn({ icon: Icon, onClick, disabled, label }: {
  icon: typeof FolderOpen
  onClick?: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 h-7 px-1.5 rounded text-[11px] text-text-secondary hover:text-text-primary hover:bg-border/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      title={label}
    >
      <Icon size={14} />
    </button>
  )
}
