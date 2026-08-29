import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileJson, FileCheck, Wrench, Sparkles, Shrink, FileSearch, GitCompare, Clock, Settings, FolderOpen, ChevronDown, Sun, Moon, Trash2 } from 'lucide-react'
import { cn, generateId } from '@/utils/helpers'
import { useEditorStore } from '@/store/editorStore'
import { useTheme } from '@/hooks/useTheme'
import { computeStatistics } from '@/utils/statistics'
import { isValidJson } from '@/services/formatter'
import { STORAGE_KEY_RECENT_FILES } from '@/constants'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileJson, label: 'Workspace', path: '/' },
  { icon: FileCheck, label: 'Validator', path: '/validator' },
  { icon: Wrench, label: 'Repair', path: '/repair' },
  { icon: Sparkles, label: 'Beautify', path: '/beautify' },
  { icon: Shrink, label: 'Minify', path: '/minify' },
  { icon: FileSearch, label: 'Schema', path: '/schema' },
  { icon: GitCompare, label: 'Diff Viewer', path: '/diff' },
  { icon: Clock, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

interface RecentFile {
  id: string
  name: string
  content: string
  status: 'valid' | 'invalid'
  size: number
  timestamp: number
}

function loadRecentFiles(): RecentFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_FILES)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveRecentFiles(files: RecentFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECENT_FILES, JSON.stringify(files.slice(0, 10)))
  } catch {}
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

function isActive(itemPath: string, pathname: string): boolean {
  if (itemPath === '/') return pathname === '/'
  return pathname === itemPath
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setContent, setFileName, setStatistics, setValidationErrors, addConsoleEntry, fileName, content } = useEditorStore()
  const { theme, setTheme } = useTheme()
  const [filesExpanded, setFilesExpanded] = useState(true)
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(loadRecentFiles)
  const [contextMenu, setContextMenu] = useState<{ file: RecentFile; x: number; y: number } | null>(null)

  useEffect(() => {
    const handleUpdate = () => setRecentFiles(loadRecentFiles())
    window.addEventListener('recentfiles:update', handleUpdate)
    return () => window.removeEventListener('recentfiles:update', handleUpdate)
  }, [])

  useEffect(() => {
    if (content.trim() && fileName) {
      const valid = isValidJson(content)
      const newFile: RecentFile = {
        id: generateId(),
        name: fileName,
        content: content.slice(0, 10000),
        status: valid ? 'valid' : 'invalid',
        size: new Blob([content]).size,
        timestamp: Date.now(),
      }
      setRecentFiles(prev => {
        const filtered = prev.filter(f => f.name !== fileName)
        const updated = [newFile, ...filtered].slice(0, 10)
        saveRecentFiles(updated)
        return updated
      })
    }
  }, [content, fileName])

  const handleOpenFile = useCallback(async (file: RecentFile) => {
    setFileName(file.name)
    setContent(file.content)
    setStatistics(computeStatistics(file.content))
    const valid = isValidJson(file.content)
    setValidationErrors(valid ? [] : [{ line: 1, column: 1, message: 'Invalid JSON', type: 'syntax' as const }])
    addConsoleEntry({ id: generateId(), type: 'info', message: `Opened ${file.name}`, timestamp: Date.now() })
    navigate('/')
  }, [setFileName, setContent, setStatistics, setValidationErrors, addConsoleEntry, navigate])

  const handleRemoveFile = useCallback((fileId: string) => {
    setRecentFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      saveRecentFiles(updated)
      return updated
    })
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, file: RecentFile) => {
    e.preventDefault()
    setContextMenu({ file, x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    return () => { window.removeEventListener('click', close); window.removeEventListener('contextmenu', close) }
  }, [contextMenu])

  return (
    <nav className="w-[220px] h-full bg-sidebar-bg border-r border-border flex flex-col shrink-0 select-none">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="px-3 pt-3 pb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">TOOLS</span>
        </div>
        <div className="flex flex-col px-2 gap-[1px]">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, location.pathname)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-2.5 transition-all shrink-0 h-[34px] px-2.5 text-left group',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                )}
                title={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[12.5px]">{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="px-3 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">FILES</span>
          <button
            onClick={() => setFilesExpanded(!filesExpanded)}
            className="w-5 h-5 flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <ChevronDown size={12} className={cn('text-text-muted transition-transform', !filesExpanded && '-rotate-90')} />
          </button>
        </div>

        {filesExpanded && (
          <div className="flex flex-col px-2 gap-[1px] overflow-y-auto">
            <div className="px-2 py-1">
              <span className="text-[10px] text-text-muted font-medium">Recent Files</span>
            </div>
            {recentFiles.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <FolderOpen size={20} className="text-text-muted/30 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[11px] text-text-muted leading-relaxed">No recent files</p>
                <p className="text-[10px] text-text-muted/70 mt-1">Open or drag a JSON file to get started.</p>
              </div>
            ) : (
              <>
                {recentFiles.slice(0, 8).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleOpenFile(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    className="flex items-center justify-between h-[32px] px-2.5 text-left hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileJson size={13} className="text-primary/60 shrink-0" strokeWidth={1.75} />
                      <span className="text-[11.5px] text-text-secondary truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-text-muted shrink-0 ml-2">{timeAgo(file.timestamp)}</span>
                  </button>
                ))}
                {recentFiles.length > 8 && (
                  <div className="px-2.5 py-1">
                    <span className="text-[10px] text-primary/70 font-medium">Show All ({recentFiles.length})</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 bg-elevated border border-border shadow-xl py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => { handleOpenFile(contextMenu.file); setContextMenu(null) }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-text hover:bg-surface-hover transition-colors"
          >
            <FolderOpen size={12} /> Open
          </button>
          <button
            onClick={() => handleRemoveFile(contextMenu.file.id)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-danger hover:bg-surface-hover transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      )}

      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 bg-success shrink-0 shadow-sm shadow-success/50" />
          <span className="text-[11px] text-text-muted">All systems operational</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Sun size={12} className="text-text-muted" /> : <Moon size={12} className="text-text-muted" />}
            <span className="text-[11px] text-text-muted">{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-6 h-6 flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <ChevronDown size={10} className="text-text-muted" />
          </button>
        </div>
      </div>
    </nav>
  )
}
