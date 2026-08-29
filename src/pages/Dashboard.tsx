import { useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck, Wrench, Sparkles, Shrink, FileSearch, GitCompare,
  ArrowRight, FolderOpen, MoreHorizontal, Folder,
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
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files.slice(0, 20)))
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
    validationErrors,
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
    } catch {
      addConsoleEntry({ id: generateId(), type: 'error', message: 'Failed to read file', timestamp: Date.now() })
    }
    e.target.value = ''
  }, [setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry])

  const handleAction = useCallback((action: typeof ACTIONS[number]) => {
    const t = action.label.toLowerCase()
    const type: ActivityEntry['type'] = t.includes('validate') ? 'validate'
      : t.includes('repair') ? 'repair'
      : t.includes('beautify') ? 'beautify'
      : t.includes('minify') ? 'minify'
      : t.includes('schema') ? 'schema'
      : 'diff'
    trackActivity({ type, label: action.label, path: action.path })
    addConsoleEntry({ id: generateId(), type: 'info', message: `Navigated to ${action.label}`, timestamp: Date.now() })
    navigate(action.path)
  }, [navigate, addConsoleEntry])

  const handleOpenRecent = useCallback((file: RecentFile) => {
    setFileName(file.name)
    addConsoleEntry({ id: generateId(), type: 'info', message: `Navigate to Workspace to view ${file.name}`, timestamp: Date.now() })
    navigate('/')
  }, [setFileName, addConsoleEntry, navigate])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />

      <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ padding: '32px' }}>
        <div style={{ minWidth: '640px', maxWidth: '1280px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-text-primary">
              Welcome back 👋
            </h1>
            <p style={{ fontSize: '15px', marginTop: '8px' }} className="text-text-secondary">
              Validate, repair and format your JSON files locally.
            </p>
          </div>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }} className="text-text-primary">Quick Actions</h2>
            <div className="overflow-x-auto -mx-2 px-2">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', minWidth: '600px' }}>
                {ACTIONS.map((action) => (
                  <ActionCard key={action.path} action={action} onClick={() => handleAction(action)} />
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }} className="text-text-primary">Recent Files</h2>
            {recentFiles.length === 0 ? (
              <EmptyState onOpen={handleOpenFile} />
            ) : (
              <RecentFilesTable files={recentFiles} onOpenRecent={handleOpenRecent} onOpen={handleOpenFile} />
            )}
          </section>
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
      className="group flex items-center gap-5 rounded-xl bg-surface border border-border p-6 transition-all duration-200 text-left hover:-translate-y-0.5 hover:shadow-lg"
      style={{ height: '104px' }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-[14px] bg-accent/10"
        style={{ width: '56px', height: '56px' }}
      >
        <Icon size={24} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '16px', fontWeight: 600 }} className="text-text-primary">{action.label}</p>
        <p style={{ fontSize: '14px', marginTop: '2px' }} className="text-text-muted leading-snug">{action.desc}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-text-muted group-hover:text-accent transition-colors" />
    </button>
  )
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-xl bg-surface border border-border flex flex-col items-center justify-center" style={{ padding: '48px 24px' }}>
      <FolderOpen size={32} className="text-text-muted/40" />
      <p style={{ fontSize: '15px', fontWeight: 500, marginTop: '16px' }} className="text-text-secondary">No recent files</p>
      <p style={{ fontSize: '14px', marginTop: '4px' }} className="text-text-muted">Open or drag a JSON file to get started.</p>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-[10px] bg-accent text-white hover:bg-accent-hover transition-colors"
        style={{ height: '40px', padding: '0 20px', fontSize: '14px', fontWeight: 500, marginTop: '16px' }}
      >
        <FolderOpen size={14} />
        Open File
      </button>
    </div>
  )
}

function RecentFilesTable({ files, onOpenRecent, onOpen: _onOpen }: {
  files: RecentFile[]
  onOpenRecent: (file: RecentFile) => void
  onOpen: () => void
}) {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <table className="w-full" style={{ fontSize: '14px' }}>
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-medium px-6 text-text-muted" style={{ height: '48px', fontSize: '12px' }}>File Name</th>
            <th className="text-left font-medium px-6 text-text-muted" style={{ height: '48px', fontSize: '12px' }}>Status</th>
            <th className="text-left font-medium px-6 text-text-muted" style={{ height: '48px', fontSize: '12px' }}>Size</th>
            <th className="text-left font-medium px-6 text-text-muted" style={{ height: '48px', fontSize: '12px' }}>Last Modified</th>
            <th className="text-right font-medium px-6 text-text-muted" style={{ height: '48px', fontSize: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              className="border-b border-border/50 last:border-0 hover:bg-hover transition-colors cursor-pointer"
              style={{ height: '52px' }}
              onClick={() => onOpenRecent(file)}
            >
              <td className="px-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-accent" style={{ fontSize: '14px' }}>{'{ }'}</span>
                  <span className="font-medium text-text-primary">{file.name}</span>
                </div>
              </td>
              <td className="px-6">
                <span className={cn(
                  'inline-flex items-center rounded-full font-medium',
                  file.status === 'valid' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                )} style={{ fontSize: '12px', height: '24px', padding: '0 8px' }}>
                  {file.status === 'valid' ? 'Valid' : 'Invalid'}
                </span>
              </td>
              <td className="px-6 text-text-secondary">{formatBytes(file.size)}</td>
              <td className="px-6 text-text-secondary">
                {new Date(file.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-6">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenRecent(file) }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                    title="Open"
                  >
                    <Folder size={14} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                    title="More"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-border flex items-center justify-center" style={{ padding: '12px' }}>
        <button
          onClick={() => _onOpen()}
          className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover transition-colors"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          Open a File
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
