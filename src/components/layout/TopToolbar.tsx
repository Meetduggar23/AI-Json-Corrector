import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, FilePlus, Search, Save, Settings, Sun, Moon, Pencil, Play, Loader2,
} from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useTheme } from '@/hooks/useTheme'
import { downloadJson } from '@/utils/download'
import { readFileAsText } from '@/utils/upload'
import { generateId } from '@/utils/helpers'
import { computeStatistics } from '@/utils/statistics'
import { validateJson } from '@/services/validator'
import toast from 'react-hot-toast'
import type { LucideIcon } from 'lucide-react'

function sanitizeFilename(name: string): string {
  let trimmed = name.trim().slice(0, 100)
  if (!trimmed) return ''
  if (!trimmed.endsWith('.json')) {
    trimmed += '.json'
  }
  return trimmed
}

function FileNameEditor({ fileName, onRename }: { fileName: string; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startEditing = useCallback(() => {
    setValue(fileName)
    setEditing(true)
  }, [fileName])

  useEffect(() => {
    if (!editing) return
    const el = inputRef.current
    if (!el) return
    el.focus()
    const dotIndex = fileName.lastIndexOf('.json')
    if (dotIndex > 0) {
      el.setSelectionRange(0, dotIndex)
    } else {
      el.select()
    }
  }, [editing, fileName])

  useEffect(() => {
    if (!editing) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [editing])

  useEffect(() => {
    if (editing) return
    const handler = () => startEditing()
    window.addEventListener('editor:rename', handler)
    return () => window.removeEventListener('editor:rename', handler)
  }, [editing, startEditing])

  const commit = useCallback(() => {
    const sanitized = sanitizeFilename(value)
    if (sanitized && sanitized !== fileName) {
      onRename(sanitized)
    }
    setEditing(false)
  }, [value, fileName, onRename])

  const cancel = useCallback(() => {
    setEditing(false)
  }, [])

  if (editing) {
    return (
      <div ref={containerRef} className="flex items-center min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
            e.stopPropagation()
          }}
          onBlur={commit}
          className="h-8 rounded-lg border border-border bg-editor-bg text-text-primary text-[13px] px-2 outline-none focus:border-accent min-w-[120px] max-w-[300px]"
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="group flex items-center gap-1.5 min-w-0 cursor-pointer rounded-lg px-1.5 -ml-1.5 hover:bg-hover transition-colors"
      onClick={startEditing}
    >
      <span className="text-[13px] text-text-muted truncate max-w-[260px]">{fileName || 'untitled.json'}</span>
      <Pencil size={12} className="shrink-0 text-text-muted/0 group-hover:text-text-muted transition-all" />
    </div>
  )
}

export function TopToolbar() {
  const {
    fileName, content, setContent, pushHistory, addConsoleEntry,
    setFileName, setStatistics, setValidationErrors, renameFile,
  } = useEditorStore()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const run = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:run'))
  }, [])
  const isRunning = useEditorStore((s) => s.isRunning)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = `${fileName || 'untitled.json'} - JSON Corrector`
  }, [fileName])

  const handleOpen = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      setContent(text)
      setFileName(file.name)
      setStatistics(computeStatistics(text))
      const result = validateJson(text)
      setValidationErrors(result.errors)
      pushHistory({ id: generateId(), content: text, timestamp: Date.now(), label: `Opened ${file.name}` })
      addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
      toast.success(`Loaded ${file.name}`)
    } catch {
      toast.error('Failed to read file')
    }
    e.target.value = ''
  }

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Nothing to save')
      return
    }
    downloadJson(content, fileName || 'untitled.json')
    toast.success('Downloaded')
  }

  const handleNew = () => {
    setContent('{\n  \n}')
    setFileName('untitled.json')
    setStatistics(null)
    setValidationErrors([])
    pushHistory({ id: generateId(), content: '{\n  \n}', timestamp: Date.now(), label: 'Created new document' })
    addConsoleEntry({ id: generateId(), type: 'info', message: 'Created new document', timestamp: Date.now() })
    toast.success('New file created')
  }

  const handleSearch = () => {
    window.dispatchEvent(new CustomEvent('editor:search'))
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const ThemeIcon = resolvedTheme === 'dark' ? Sun : Moon

  const handleRename = useCallback((newName: string) => {
    renameFile(fileName || 'untitled.json', newName)
    addConsoleEntry({ id: generateId(), type: 'info', message: `Renamed to ${newName}`, timestamp: Date.now() })
  }, [fileName, renameFile, addConsoleEntry])

  return (
    <header className="h-14 bg-toolbar border-b border-border flex items-center justify-between px-6 shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">JSON Corrector</span>
        </div>
        <span className="w-px h-4 bg-border" />
        <FileNameEditor fileName={fileName || 'untitled.json'} onRename={handleRename} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        <ToolBtn icon={FolderOpen} onClick={handleOpen} label="Open File" variant="outlined" />
        <ToolBtn icon={FilePlus} onClick={handleNew} label="New File" variant="primary" />
        <RunBtn onClick={run} loading={isRunning} />
        <IconBtn icon={Search} onClick={handleSearch} label="Search (Ctrl+F)" />
        <IconBtn icon={Save} onClick={handleSave} label="Save (Ctrl+S)" />
        <IconBtn icon={Settings} onClick={handleSettings} label="Settings" />
        <IconBtn icon={ThemeIcon} onClick={cycleTheme} label={`Theme: ${theme}`} />
      </div>
    </header>
  )
}

function RunBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-accent text-white text-[14px] font-semibold hover:brightness-110 transition-all duration-150 disabled:opacity-50 disabled:cursor-wait"
      style={{ height: '40px', padding: '0 20px', borderRadius: '10px' }}
      title="Run (Ctrl+Enter)"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
      <span>Run</span>
    </button>
  )
}

function ToolBtn({ icon: Icon, onClick, label, variant = 'ghost' }: {
  icon: LucideIcon
  onClick?: () => void
  label: string
  variant?: 'primary' | 'outlined' | 'ghost'
}) {
  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-xl bg-accent text-white text-[14px] font-medium hover:brightness-110 transition-all duration-150"
        style={{ height: '40px', padding: '0 20px', borderRadius: '10px' }}
        title={label}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    )
  }
  if (variant === 'outlined') {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-xl border border-border text-text-primary text-[14px] font-medium hover:bg-hover transition-all duration-150"
        style={{ height: '40px', padding: '0 20px', borderRadius: '10px' }}
        title={label}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-hover transition-all duration-150"
      style={{ borderRadius: '10px' }}
      title={label}
    >
      <Icon size={20} />
    </button>
  )
}

function IconBtn({ icon: Icon, onClick, label }: {
  icon: LucideIcon
  onClick?: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-hover transition-all duration-150"
      style={{ borderRadius: '10px' }}
      title={label}
    >
      <Icon size={20} />
    </button>
  )
}
