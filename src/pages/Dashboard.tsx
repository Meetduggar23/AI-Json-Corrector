import { useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck, Wrench, Sparkles, Shrink, FileSearch, GitCompare,
  ArrowRight, FolderOpen, Folder,
} from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn, formatBytes, generateId } from '@/utils/helpers'
import { readFileAsText } from '@/utils/upload'
import { computeStatistics } from '@/utils/statistics'
import { isValidJson } from '@/services/formatter'
import { trackActivity, type ActivityEntry } from '@/utils/activity'
import { STORAGE_KEY_RECENT_FILES } from '@/constants'

interface RecentFile {
  id: string
  name: string
  status: 'valid' | 'invalid'
  size: number
  timestamp: number
}

const STORAGE_KEY_FILES = STORAGE_KEY_RECENT_FILES

const ACTIONS = [
  { icon: FileCheck, label: 'Validate JSON', desc: 'Check JSON syntax and structure', path: '/validator' },
  { icon: Wrench, label: 'Repair JSON', desc: 'Automatically fix common JSON errors', path: '/repair' },
  { icon: Sparkles, label: 'Beautify JSON', desc: 'Pretty print with custom indentation', path: '/beautify' },
  { icon: Shrink, label: 'Minify JSON', desc: 'Remove whitespace and compress JSON', path: '/minify' },
  { icon: FileSearch, label: 'Schema Validation', desc: 'Validate JSON against a schema', path: '/schema' },
  { icon: GitCompare, label: 'Diff Viewer', desc: 'Compare original and corrected JSON', path: '/diff' },
]

function loadRecentFiles(): RecentFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES)
    if (raw) return JSON.parse(raw)
  } catch { }
  return []
}

function saveRecentFiles(files: RecentFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files.slice(0, 10)))
  } catch { }
}

function trackFileOpen(name: string, status: 'valid' | 'invalid', size: number): void {
  try {
    const files = loadRecentFiles()
    const existing = files.findIndex((f) => f.name === name)
    if (existing >= 0) files.splice(existing, 1)
    files.unshift({ id: generateId(), name, status, size, timestamp: Date.now() })
    saveRecentFiles(files)
  } catch { }
}

export function Dashboard() {
  const {
    setContent, setFileName, setStatistics, setValidationErrors,
    addConsoleEntry,
  } = useEditorStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recentFiles = useMemo(() => loadRecentFiles(), [])

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      setFileName(file.name)
      setContent(text)
      setStatistics(computeStatistics(text))
      const valid = isValidJson(text)
      setValidationErrors(valid ? [] : [{ line: 1, column: 1, message: 'Invalid JSON', type: 'syntax' as const }])
      trackFileOpen(file.name, valid ? 'valid' : 'invalid', text.length)
      trackActivity({ type: 'open', label: `Opened ${file.name}`, path: '/' })
      addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
      navigate('/')
    } catch {
      addConsoleEntry({ id: generateId(), type: 'error', message: 'Failed to read file', timestamp: Date.now() })
    }
    e.target.value = ''
  }, [setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry, navigate])

  const handleNewFile = useCallback(() => {
    setContent('{\n  \n}')
    setFileName('untitled.json')
    setStatistics(null)
    setValidationErrors([])
    navigate('/')
  }, [setContent, setFileName, setStatistics, setValidationErrors, navigate])

  const handleAction = useCallback((action: typeof ACTIONS[number]) => {
    const t = action.label.toLowerCase()
    const type: ActivityEntry['type'] = t.includes('validate') ? 'validate'
      : t.includes('repair') ? 'repair'
      : t.includes('beautify') ? 'beautify'
      : t.includes('minify') ? 'minify'
      : t.includes('schema') ? 'schema'
      : 'diff'
    trackActivity({ type, label: action.label, path: action.path })
    navigate(action.path)
  }, [navigate])

  const handleOpenRecent = useCallback((file: RecentFile) => {
    setFileName(file.name)
    navigate('/')
  }, [setFileName, navigate])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1024px' }}>
          {/* Welcome */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 600, lineHeight: 1.2 }} className="text-text">
              Welcome back 👋
            </h1>
            <p style={{ fontSize: '14px', marginTop: '8px' }} className="text-text-secondary">
              Validate, repair and format your JSON files locally.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex gap-3" style={{ marginBottom: '32px' }}>
            <button
              onClick={handleOpenFile}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:brightness-110 transition-all h-10 px-5"
            >
              <FolderOpen size={16} />
              Open JSON File
            </button>
            <button
              onClick={handleNewFile}
              className="inline-flex items-center gap-2 rounded-lg border border-border text-text text-[13px] font-medium hover:bg-surface-hover transition-all h-10 px-5"
            >
              Create New JSON
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }} className="text-text">Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {ACTIONS.map((action) => (
                <ActionCard key={action.path} action={action} onClick={() => handleAction(action)} />
              ))}
            </div>
          </div>

          {/* Recent Files */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }} className="text-text">Recent Files</h2>
            {recentFiles.length === 0 ? (
              <EmptyState onOpen={handleOpenFile} />
            ) : (
              <RecentFilesTable files={recentFiles} onOpenRecent={handleOpenRecent} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ action, onClick }: { action: typeof ACTIONS[number]; onClick: () => void }) {
  const Icon = action.icon
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl bg-surface border border-border p-[18px] transition-all duration-150 text-left hover:bg-surface-hover"
      style={{ height: '96px' }}
    >
      <div className="flex items-center justify-center shrink-0 rounded-lg bg-primary/10 w-[42px] h-[42px]">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-text">{action.label}</p>
        <p className="text-[13px] text-text-muted mt-0.5 leading-snug">{action.desc}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-text-muted group-hover:text-primary transition-colors" />
    </button>
  )
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-xl bg-surface border border-border flex flex-col items-center justify-center p-12">
      <FolderOpen size={28} className="text-text-muted/40" />
      <p className="text-[14px] font-medium text-text-secondary mt-3">No recent files</p>
      <p className="text-[13px] text-text-muted mt-1">Open or drag a JSON file to get started.</p>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:brightness-110 transition-all h-10 px-5 mt-4"
      >
        <FolderOpen size={14} />
        Open File
      </button>
    </div>
  )
}

function RecentFilesTable({ files, onOpenRecent }: { files: RecentFile[]; onOpenRecent: (file: RecentFile) => void }) {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-medium px-5 text-text-muted h-10 text-[12px]">File Name</th>
            <th className="text-left font-medium px-5 text-text-muted h-10 text-[12px]">Status</th>
            <th className="text-left font-medium px-5 text-text-muted h-10 text-[12px]">Size</th>
            <th className="text-left font-medium px-5 text-text-muted h-10 text-[12px]">Last Opened</th>
            <th className="text-right font-medium px-5 text-text-muted h-10 text-[12px]">Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors cursor-pointer"
              style={{ height: '44px' }}
              onClick={() => onOpenRecent(file)}
            >
              <td className="px-5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-primary text-[13px]">{'{ }'}</span>
                  <span className="font-medium text-text text-[13px]">{file.name}</span>
                </div>
              </td>
              <td className="px-5">
                <span className={cn(
                  'inline-flex items-center rounded-full font-medium text-[11px] h-5 px-2',
                  file.status === 'valid' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                )}>
                  {file.status === 'valid' ? 'Valid' : 'Invalid'}
                </span>
              </td>
              <td className="px-5 text-text-secondary text-[13px]">{formatBytes(file.size)}</td>
              <td className="px-5 text-text-secondary text-[13px]">
                {new Date(file.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-5">
                <div className="flex items-center justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenRecent(file) }}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                    title="Open in Workspace"
                  >
                    <Folder size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
