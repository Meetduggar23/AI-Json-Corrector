import { useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck, Wrench, Sparkles, Shrink, FileSearch, GitCompare,
  ArrowRight, FolderOpen, MoreHorizontal, Folder,
  XCircle, CheckCircle,
} from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn, formatBytes, generateId } from '@/utils/helpers'
import { readFileAsText } from '@/utils/upload'
import { computeStatistics } from '@/utils/statistics'
import { isValidJson } from '@/services/formatter'
import { trackActivity, type ActivityEntry } from '@/utils/activity'

interface RecentFile {
  id: string
  name: string
  content: string
  status: 'valid' | 'invalid'
  size: number
  timestamp: number
}

const STORAGE_KEY_FILES = 'json-corrector-recent-files'

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
  } catch {}
  return []
}

function saveRecentFiles(files: RecentFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files.slice(0, 20)))
  } catch {}
}

function trackFileOpen(name: string, content: string, status: 'valid' | 'invalid', size: number): void {
  try {
    const files = loadRecentFiles()
    const existing = files.findIndex((f) => f.name === name)
    if (existing >= 0) files.splice(existing, 1)
    files.unshift({ id: generateId(), name, content, status, size, timestamp: Date.now() })
    saveRecentFiles(files)
  } catch {}
}

const bottomTabs = [
  { id: 'problems' as const, label: 'Problems' },
  { id: 'output' as const, label: 'Output' },
  { id: 'logs' as const, label: 'Logs' },
  { id: 'history' as const, label: 'History' },
  { id: 'schema' as const, label: 'Schema' },
]

export function Dashboard() {
  const {
    content, validationErrors, consoleEntries, history,
    setContent, setFileName, setStatistics, setValidationErrors,
    addConsoleEntry, pushHistory,
  } = useEditorStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeBottomTab, setActiveBottomTab] = useState<'problems' | 'output' | 'logs' | 'history' | 'schema'>('problems')

  const recentFiles = useMemo(() => loadRecentFiles(), [content])

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
      trackFileOpen(file.name, text, valid ? 'valid' : 'invalid', text.length)
      trackActivity({ type: 'open', label: `Opened ${file.name}`, path: '/' })
      addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
    } catch {
      addConsoleEntry({ id: generateId(), type: 'error', message: 'Failed to read file', timestamp: Date.now() })
    }
    e.target.value = ''
  }, [setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry])

  const handleNewFile = useCallback(() => {
    setContent('{\n  \n}')
    setFileName('untitled.json')
    setStatistics(null)
    setValidationErrors([])
    pushHistory({ id: generateId(), content: '{\n  \n}', timestamp: Date.now(), label: 'Created new document' })
    trackActivity({ type: 'open', label: 'Created new document', path: '/' })
    addConsoleEntry({ id: generateId(), type: 'info', message: 'Created new document', timestamp: Date.now() })
  }, [setContent, setFileName, setStatistics, setValidationErrors, pushHistory, addConsoleEntry])

  const handleAction = useCallback((action: typeof ACTIONS[number]) => {
    const t = action.label.toLowerCase()
    const type = t.includes('validate') ? 'validate' : t.includes('repair') ? 'repair' : t.includes('beautify') ? 'beautify' : t.includes('minify') ? 'minify' : t.includes('schema') ? 'schema' : 'diff'
    trackActivity({ type: type as ActivityEntry['type'], label: action.label, path: action.path })
    addConsoleEntry({ id: generateId(), type: 'info', message: `Navigated to ${action.label}`, timestamp: Date.now() })
    navigate(action.path)
  }, [navigate, addConsoleEntry])

  const handleOpenRecent = useCallback((file: RecentFile) => {
    setContent(file.content)
    setFileName(file.name)
    setStatistics(computeStatistics(file.content))
    const valid = isValidJson(file.content)
    setValidationErrors(valid ? [] : [{ line: 1, column: 1, message: 'Invalid JSON', type: 'syntax' as const }])
    trackActivity({ type: 'open', label: `Opened ${file.name} from recents`, path: '/' })
    addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
  }, [setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />

      <div className="flex-1 overflow-y-auto" style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1280px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-text-primary">
              Welcome back<span className="inline-block">{'\u{1F44B}'}</span>
            </h1>
            <p style={{ fontSize: '15px', marginTop: '8px' }} className="text-text-secondary">
              Validate, repair and format your JSON files locally. Fast, private and offline.
            </p>
          </div>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }} className="text-text-primary">Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {ACTIONS.map((action) => (
                <ActionCard key={action.path} action={action} onClick={() => handleAction(action)} />
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }} className="text-text-primary">Recent Files</h2>
            {recentFiles.length === 0 ? (
              <EmptyState onOpen={handleOpenFile} />
            ) : (
              <RecentFilesTable files={recentFiles} onOpenRecent={handleOpenRecent} onOpen={handleOpenFile} navigate={navigate} />
            )}
          </section>
        </div>
      </div>

      <BottomPanel
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
        validationErrors={validationErrors}
        consoleEntries={consoleEntries}
        history={history}
      />
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

function RecentFilesTable({ files, onOpenRecent, onOpen: _onOpen, navigate: nav }: {
  files: RecentFile[]
  onOpenRecent: (file: RecentFile) => void
  onOpen: () => void
  navigate: (path: string) => void
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
          onClick={() => nav('/history')}
          className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover transition-colors"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          View All History
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

function BottomPanel({
  activeTab, onTabChange, validationErrors, consoleEntries, history,
}: {
  activeTab: string
  onTabChange: (tab: 'problems' | 'output' | 'logs' | 'history' | 'schema') => void
  validationErrors: { line: number; column: number; message: string }[]
  consoleEntries: { id: string; type: string; message: string; timestamp: number }[]
  history: { id: string; content: string; timestamp: number; label: string }[]
}) {
  const { setContent } = useEditorStore()
  return (
    <div className="shrink-0 bg-bg-primary border-t border-border flex flex-col" style={{ height: '180px' }}>
      <div className="flex items-center shrink-0 border-b border-border" style={{ height: '40px', padding: '0 24px', gap: '16px' }}>
        {bottomTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const count = tab.id === 'problems' ? validationErrors.length : 0
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={cn(
                'relative flex items-center gap-1.5 transition-colors shrink-0',
                isActive ? 'text-text-primary font-medium' : 'text-text-muted hover:text-text-secondary'
              )}
              style={{ height: '100%', fontSize: '14px' }}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="flex items-center justify-center rounded-full bg-danger text-white font-semibold" style={{ minWidth: '18px', height: '18px', fontSize: '10px', padding: '0 4px' }}>
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 rounded-full bg-accent" style={{ height: '2px' }} />
              )}
            </button>
          )
        })}
      </div>
      <div className="flex-1 overflow-y-auto font-mono" style={{ padding: '12px 24px', fontSize: '12px' }}>
        {activeTab === 'problems' && (
          validationErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <CheckCircle size={20} className="text-success mb-2" />
              <p className="text-text-primary font-medium" style={{ fontSize: '14px' }}>No problems detected</p>
              <p className="text-text-muted" style={{ fontSize: '13px', marginTop: '2px' }}>Your JSON is valid and well-formed.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {validationErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 py-1 px-2 rounded-lg hover:bg-hover">
                  <XCircle size={12} className="text-danger shrink-0 mt-0.5" />
                  <span className="text-text-primary">{err.message}</span>
                  <span className="text-text-muted ml-auto shrink-0" style={{ fontSize: '10px' }}>L{err.line}:{err.column}</span>
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === 'output' && (
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle size={12} />
              <span style={{ fontSize: '13px' }}>JSON Corrector ready</span>
            </div>
            <p className="text-text-muted" style={{ fontSize: '11px', paddingLeft: '20px' }}>All features operate offline. No data is sent to any server.</p>
          </div>
        )}
        {activeTab === 'logs' && (
          consoleEntries.length === 0 ? (
            <div className="text-text-muted italic" style={{ fontSize: '12px', paddingTop: '8px' }}>No log entries yet.</div>
          ) : (
            <div className="space-y-0.5">
              {consoleEntries.slice(-50).map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 py-0.5 px-1 rounded-lg hover:bg-hover">
                  <span className={cn(
                    'shrink-0 mt-0.5',
                    entry.type === 'error' ? 'text-danger' : entry.type === 'success' ? 'text-success' : entry.type === 'warning' ? 'text-warning' : 'text-text-secondary'
                  )} style={{ fontSize: '12px' }}>
                    {entry.type === 'error' ? '\u2715' : entry.type === 'success' ? '\u2713' : entry.type === 'warning' ? '\u26A0' : '\u2139'}
                  </span>
                  <span className="text-text-primary flex-1">{entry.message}</span>
                  <span className="text-text-muted shrink-0" style={{ fontSize: '10px' }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === 'history' && (
          history.length === 0 ? (
            <div className="text-text-muted italic" style={{ fontSize: '12px', paddingTop: '8px' }}>No history yet.</div>
          ) : (
            <div className="space-y-0.5">
              {history.slice(-20).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-hover">
                  <div className="min-w-0 flex-1">
                    <span className="text-text-primary" style={{ fontSize: '12px' }}>{entry.label}</span>
                    <span className="text-text-muted ml-2" style={{ fontSize: '10px' }}>
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    onClick={() => setContent(entry.content)}
                    className="text-accent hover:text-accent-hover shrink-0 ml-2 font-medium"
                    style={{ fontSize: '10px' }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === 'schema' && (
          <div className="text-text-muted" style={{ fontSize: '12px', paddingTop: '12px' }}>Run schema validation to see results here.</div>
        )}
      </div>
    </div>
  )
}
