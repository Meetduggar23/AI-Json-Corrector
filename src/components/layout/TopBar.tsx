import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, FilePlus, Search, Save, Settings, Sun, Moon, Pencil, Play, Loader2 } from 'lucide-react'
import { useEditorStore, useSettingsStore } from '@/store/editorStore'
import { useTheme } from '@/hooks/useTheme'
import { downloadJson } from '@/utils/download'
import { readFileAsText } from '@/utils/upload'
import { beautifyJson } from '@/services/formatter'
import { generateId } from '@/utils/helpers'
import { computeStatistics } from '@/utils/statistics'
import { validateJson } from '@/services/validator'
import { triggerSearch } from '@/utils/editorApi'
import toast from 'react-hot-toast'

function sanitizeFilename(name: string): string {
  let t = name.trim().slice(0, 100)
  if (!t) return ''
  if (!t.endsWith('.json')) t += '.json'
  return t
}

function FileNameEditor({ fileName, onRename }: { fileName: string; onRename: (n: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const start = useCallback(() => { setValue(fileName); setEditing(true) }, [fileName])

  useEffect(() => {
    if (!editing) return
    const el = inputRef.current
    if (!el) return
    el.focus()
    const d = fileName.lastIndexOf('.json')
    if (d > 0) el.setSelectionRange(0, d); else el.select()
  }, [editing, fileName])

  useEffect(() => {
    if (editing) return
    const h = () => start()
    window.addEventListener('editor:rename', h)
    return () => window.removeEventListener('editor:rename', h)
  }, [editing, start])

  const commit = useCallback(() => {
    const s = sanitizeFilename(value)
    if (s && s !== fileName) onRename(s)
    setEditing(false)
  }, [value, fileName, onRename])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); e.stopPropagation() }}
        onBlur={commit}
        className="h-6 border border-primary/50 bg-surface text-text text-[12px] px-2 outline-none min-w-[100px] max-w-[240px]"
      />
    )
  }

  return (
    <button className="group flex items-center gap-1.5 min-w-0 px-2 py-1 hover:bg-surface-hover transition-colors" onClick={start} title="Rename (F2)">
      <span className="text-[12px] text-text-secondary truncate max-w-[200px]">{fileName || 'untitled.json'}</span>
      <Pencil size={10} className="shrink-0 text-transparent group-hover:text-text-muted transition-colors" />
    </button>
  )
}

export function TopBar() {
  const { fileName, content, setContent, pushHistory, addConsoleEntry, setFileName, setStatistics, setValidationErrors, renameFile } = useEditorStore()
  const { theme, setTheme } = useTheme()
  const { autoFormat, tabSize, indentStyle } = useSettingsStore()
  const run = useCallback(() => { window.dispatchEvent(new CustomEvent('editor:run')) }, [])
  const isRunning = useEditorStore((s) => s.isRunning)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const raw = await readFileAsText(file)
      let text = raw
      if (autoFormat) { const indent = indentStyle === 'tab' ? 'tab' as const : tabSize as 2 | 4 | 8; text = beautifyJson(raw, indent) }
      setContent(text); setFileName(file.name); setStatistics(computeStatistics(text))
      const r = validateJson(text); setValidationErrors(r.errors)
      pushHistory({ id: generateId(), content: text, timestamp: Date.now(), label: `Opened ${file.name}` })
      addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
      toast.success(`Loaded ${file.name}`)
    } catch { toast.error('Failed to read file') }
    e.target.value = ''
  }

  const handleSave = useCallback(() => {
    if (!content.trim()) { toast.error('Nothing to save'); return }
    downloadJson(content, fileName || 'untitled.json'); toast.success('Downloaded')
  }, [content, fileName])

  useEffect(() => {
    const h = () => handleSave()
    window.addEventListener('editor:save', h)
    return () => window.removeEventListener('editor:save', h)
  }, [handleSave])

  const handleNew = () => {
    setContent('{\n  \n}'); setFileName('untitled.json'); setStatistics(null); setValidationErrors([])
    pushHistory({ id: generateId(), content: '{\n  \n}', timestamp: Date.now(), label: 'New document' })
    addConsoleEntry({ id: generateId(), type: 'info', message: 'New document', timestamp: Date.now() })
  }

  const handleRename = useCallback((n: string) => {
    renameFile(fileName || 'untitled.json', n)
    addConsoleEntry({ id: generateId(), type: 'info', message: `Renamed to ${n}`, timestamp: Date.now() })
  }, [fileName, renameFile, addConsoleEntry])

  const cycleTheme = useCallback(() => {
    if (theme === 'dark') setTheme('light')
    else setTheme('dark')
  }, [theme, setTheme])

  return (
    <header className="h-[52px] bg-topbar-bg border-b border-border flex items-center justify-between px-4 shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-primary/15 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-text tracking-tight">JSON Corrector</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <FileNameEditor fileName={fileName || 'untitled.json'} onRename={handleRename} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        <TopBtn icon={FolderOpen} onClick={handleOpen} label="Open File" showLabel />
        <TopBtn icon={FilePlus} onClick={handleNew} label="New File" showLabel />
        <div className="w-px h-5 bg-border mx-1.5" />
        <button
          onClick={run}
          disabled={isRunning}
          className="h-8 px-4 bg-primary text-white text-[12px] font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 inline-flex items-center gap-1.5 shadow-sm shadow-primary/25"
          title="Run (Ctrl+Enter)"
        >
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
          Run
        </button>
        <TopBtn icon={Search} onClick={triggerSearch} label="Search" />
        <TopBtn icon={Save} onClick={handleSave} label="Save" />
        <TopBtn icon={Settings} onClick={() => navigate('/settings')} label="Settings" />
        <div className="w-px h-5 bg-border mx-1.5" />
        <button
          onClick={cycleTheme}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          title={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
        </button>
      </div>
    </header>
  )
}

function TopBtn({ icon: Icon, onClick, label, showLabel, shortcut }: { icon: typeof FolderOpen; onClick: () => void; label: string; showLabel?: boolean; shortcut?: string }) {
  return (
    <button
      onClick={onClick}
      className="h-8 px-2.5 flex items-center gap-1.5 text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      <Icon size={15} strokeWidth={1.75} />
      {showLabel && <span className="text-[12px] font-medium">{label}</span>}
      {shortcut && <span className="text-[10px] text-text-muted ml-0.5">{shortcut}</span>}
    </button>
  )
}
