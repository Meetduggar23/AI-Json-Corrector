import { useRef, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileCheck, Wrench, Sparkles, Shrink, FileSearch, GitCompare, FolderOpen, Folder, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useTrashStore } from '@/store/trashStore'
import { cn, formatBytes, generateId } from '@/utils/helpers'
import { readFileAsText } from '@/utils/upload'
import { computeStatistics } from '@/utils/statistics'
import { isValidJson } from '@/services/formatter'
import { trackActivity } from '@/utils/activity'
import { STORAGE_KEY_RECENT_FILES } from '@/constants'
import toast from 'react-hot-toast'

interface RecentFile { id: string; name: string; status: 'valid' | 'invalid'; size: number; timestamp: number }

const ACTIONS = [
  { icon: FileCheck, label: 'Validate', path: '/validator', color: 'text-primary' },
  { icon: Wrench, label: 'Repair', path: '/repair', color: 'text-success' },
  { icon: Sparkles, label: 'Beautify', path: '/beautify', color: 'text-warning' },
  { icon: Shrink, label: 'Minify', path: '/minify', color: 'text-danger' },
  { icon: FileSearch, label: 'Schema', path: '/schema', color: 'text-primary' },
  { icon: GitCompare, label: 'Diff', path: '/diff', color: 'text-text-secondary' },
]

function loadRecentFiles(): RecentFile[] {
  try { const r = localStorage.getItem(STORAGE_KEY_RECENT_FILES); if (r) return JSON.parse(r) } catch {} return []
}

function saveRecentFiles(files: RecentFile[]) {
  try { localStorage.setItem(STORAGE_KEY_RECENT_FILES, JSON.stringify(files.slice(0, 10))) } catch {}
}

export function Dashboard() {
  const { setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry } = useEditorStore()
  const { moveToTrash } = useTrashStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(loadRecentFiles)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const text = await readFileAsText(file)
      setFileName(file.name); setContent(text); setStatistics(computeStatistics(text))
      const valid = isValidJson(text); setValidationErrors(valid ? [] : [{ line: 1, column: 1, message: 'Invalid JSON', type: 'syntax' as const }])
      trackActivity({ type: 'open', label: `Opened ${file.name}`, path: '/' })
      addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
      navigate('/')
    } catch { addConsoleEntry({ id: generateId(), type: 'error', message: 'Failed to read file', timestamp: Date.now() }) }
    e.target.value = ''
  }, [setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry, navigate])

  const handleNew = useCallback(() => {
    setContent('{\n  \n}'); setFileName('untitled.json'); setStatistics(null); setValidationErrors([]); navigate('/')
  }, [setContent, setFileName, setStatistics, setValidationErrors, navigate])

  const handleDeleteFile = useCallback((e: React.MouseEvent, file: RecentFile) => {
    e.stopPropagation()
    moveToTrash({ id: file.id, name: file.name, content: '', size: file.size })
    setRecentFiles(prev => {
      const updated = prev.filter(f => f.id !== file.id)
      saveRecentFiles(updated)
      return updated
    })
    toast.success(`Moved ${file.name} to trash`)
  }, [moveToTrash])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[860px] mx-auto">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-text mb-1 tracking-tight">JSON Workspace</h1>
            <p className="text-[13px] text-text-secondary leading-relaxed">Validate, repair and format JSON locally.</p>
          </div>

          <div className="flex gap-2.5 mb-8">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-5 bg-primary text-white text-[12px] font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2 shadow-sm shadow-primary/20"
            >
              <FolderOpen size={14} strokeWidth={2} /> Open File
            </button>
            <button
              onClick={handleNew}
              className="h-9 px-5 border border-border bg-surface text-text text-[12px] font-medium hover:bg-surface-hover transition-colors inline-flex items-center gap-2"
            >
              New JSON
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 px-4 py-3 bg-surface border border-border hover:border-border/80 hover:bg-surface-hover transition-all text-left group"
                >
                  <div className={cn('w-8 h-8 flex items-center justify-center bg-bg transition-colors', a.color)}>
                    <a.icon size={16} strokeWidth={1.75} />
                  </div>
                  <span className="text-[12px] font-medium text-text-secondary group-hover:text-text transition-colors">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">Recent Files</h2>
            {recentFiles.length === 0 ? (
              <div className="bg-surface border border-border p-8 text-center">
                <FolderOpen size={24} className="text-text-muted/30 mx-auto mb-2" />
                <p className="text-[13px] text-text-secondary font-medium">No recent files</p>
                <p className="text-[12px] text-text-muted mt-1">Open a JSON file to get started.</p>
              </div>
            ) : (
              <div className="bg-surface border border-border overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium px-4 py-2.5 text-text-muted">File</th>
                      <th className="text-left font-medium px-4 py-2.5 text-text-muted">Status</th>
                      <th className="text-left font-medium px-4 py-2.5 text-text-muted">Size</th>
                      <th className="text-left font-medium px-4 py-2.5 text-text-muted">Modified</th>
                      <th className="text-right font-medium px-4 py-2.5 text-text-muted">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="border-b border-border/50 last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"
                        onClick={() => { setFileName(file.name); navigate('/') }}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 bg-primary/8 text-primary flex items-center justify-center text-[10px] font-mono font-bold">{'{ }'}</span>
                            <span className="font-medium text-text">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn(
                            'inline-flex items-center font-medium text-[10px] px-2 py-0.5',
                            file.status === 'valid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          )}>
                            {file.status === 'valid' ? 'Valid' : 'Invalid'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-text-secondary">{formatBytes(file.size)}</td>
                        <td className="px-4 py-2.5 text-text-secondary">
                          {new Date(file.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setFileName(file.name); navigate('/') }}
                              className="w-7 h-7 inline-flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                              title="Open"
                            >
                              <Folder size={13} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteFile(e, file)}
                              className="w-7 h-7 inline-flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                              title="Move to Trash"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
