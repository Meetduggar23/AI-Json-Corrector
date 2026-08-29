import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, FolderOpen, Wrench, History, FileText, Hash, Type, Braces, GitCompare, Sparkles, Shrink, FileCheck, FileSearch, Settings, Layers, BarChart3 } from 'lucide-react'
import { useEditorStore, useSettingsStore } from '@/store/editorStore'
import { cn, formatBytes } from '@/utils/helpers'
import { minifyJson, beautifyJson } from '@/services/formatter'
import { diffArrays } from 'diff'
import type { LucideIcon } from 'lucide-react'
import type { JsonStatistics } from '@/types/json'

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function lineDiff(original: string, modified: string) {
  if (!original && !modified) return { added: 0, removed: 0, modified: 0 }
  const changes = diffArrays(original.split('\n'), modified.split('\n'))
  let added = 0, removed = 0, modifiedCount = 0
  for (let i = 0; i < changes.length; i++) {
    const c = changes[i]
    if (c.added) {
      if (i > 0 && changes[i - 1].removed) {
        modifiedCount += Math.min(changes[i - 1].count || 0, c.count || 0)
      } else {
        added += c.count || 0
      }
    } else if (c.removed) {
      if (i === changes.length - 1 || !changes[i + 1].added) {
        removed += c.count || 0
      }
    }
  }
  return { added, removed, modified: clamp(modifiedCount, 0, modifiedCount) }
}

function getJsonRootType(json: string): string {
  try {
    const v = JSON.parse(json)
    if (Array.isArray(v)) return 'array'
    if (v === null) return 'null'
    return typeof v
  } catch { return 'invalid' }
}

const navPaths = {
  dashboard: '/dashboard',
  workspace: '/',
  validator: '/validator',
  repair: '/repair',
  beautify: '/beautify',
  minify: '/minify',
  schema: '/schema',
  diff: '/diff',
  history: '/history',
  settings: '/settings',
} as const

export function RightPanel() {
  const location = useLocation()
  const path = location.pathname
  const {
    content, originalContent, validationErrors, statistics, history: historyEntries, fileName,
  } = useEditorStore()
  const { theme, fontSize, tabSize } = useSettingsStore()

  const [workspaceOpen, setWorkspaceOpen] = useState(true)
  const [contextOpen, setContextOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)

  const hasContent = content.trim().length > 0
  const recentRepairs = historyEntries.filter((h) => h.label.toLowerCase().includes('repair')).length

  const diffStats = useMemo(() => lineDiff(originalContent, content), [originalContent, content])

  const beautified = useMemo(() => hasContent ? beautifyJson(content) : '', [content, hasContent])
  const minified = useMemo(() => hasContent ? minifyJson(content) : '', [content, hasContent])
  const originalSize = content.length
  const formattedSize = beautified.length
  const compressedSize = minified.length
  const savedBytes = clamp(originalSize - compressedSize, 0, originalSize)

  const rootType = getJsonRootType(content)
  const errorCount = validationErrors.length
  const firstError = validationErrors[0]

  return (
    <div className="h-full bg-panel-bg overflow-y-auto flex flex-col w-full p-4 gap-3">
      <Section title="Workspace" open={workspaceOpen} onToggle={setWorkspaceOpen}>
        <Row icon={FolderOpen} label="Open Files" value={hasContent ? '1' : '0'} />
        <Row icon={Wrench} label="Recent Repairs" value={String(recentRepairs)} />
        <Row icon={History} label="History Entries" value={String(historyEntries.length)} />
      </Section>

      <Section title={getContextTitle(path)} open={contextOpen} onToggle={setContextOpen}>
        {renderContext(path, {
          hasContent, errorCount, firstError, statistics,
          diffStats, recentRepairs, historyEntries, content, originalContent,
          originalSize, formattedSize, compressedSize, savedBytes,
          rootType, path, theme, fontSize, tabSize,
        })}
      </Section>

      {hasContent && (
        <Section title="Inspector" open={inspectorOpen} onToggle={setInspectorOpen}>
          <Row icon={Braces} label="Root Type" value={rootType} />
          <Row icon={FileText} label="File Name" value={fileName} />
          <Row icon={Hash} label="Characters" value={String(content.length)} />
          <Row icon={Type} label="Lines" value={String(content.split('\n').length)} />
          {statistics && (
            <>
              <Row icon={Layers} label="Max Depth" value={String(statistics.maxDepth)} />
              <Row icon={BarChart3} label="Keys" value={String(statistics.keys)} />
            </>
          )}
        </Section>
      )}

      {!hasContent && (
        <div className="flex flex-col items-center justify-center rounded-lg bg-surface border border-border p-6">
          <FolderOpen size={20} className="text-text-muted/40 mb-2" />
          <p className="text-[13px] text-text-secondary font-medium">No document loaded</p>
          <p className="text-[12px] text-text-muted mt-1 text-center">Open or paste JSON to inspect.</p>
        </div>
      )}
    </div>
  )
}

function getContextTitle(path: string): string {
  if (path === navPaths.validator) return 'Validation'
  if (path === navPaths.repair) return 'Repair Summary'
  if (path === navPaths.beautify) return 'Formatting'
  if (path === navPaths.minify) return 'Compression'
  if (path === navPaths.schema) return 'Schema Status'
  if (path === navPaths.diff) return 'Diff Summary'
  if (path === navPaths.history) return 'History'
  if (path === navPaths.settings) return 'Preferences'
  if (path === navPaths.dashboard) return 'Status'
  return 'Overview'
}

interface ContextProps {
  hasContent: boolean
  errorCount: number
  firstError: { line: number; column: number; message: string } | undefined
  statistics: JsonStatistics | null
  diffStats: { added: number; removed: number; modified: number }
  recentRepairs: number
  historyEntries: { id: string; content: string; timestamp: number; label: string }[]
  content: string
  originalContent: string
  originalSize: number
  formattedSize: number
  compressedSize: number
  savedBytes: number
  rootType: string
  path: string
  theme: string
  fontSize: number
  tabSize: number
}

function renderContext(path: string, p: ContextProps) {
  switch (path) {
    case '/validator':
      return (
        <>
          <StatusBadge label="JSON Status" valid={p.hasContent && p.errorCount === 0} invalid={p.hasContent && p.errorCount > 0} empty={!p.hasContent}>
            {!p.hasContent ? 'No content' : p.errorCount === 0 ? 'Valid' : `${p.errorCount} error${p.errorCount !== 1 ? 's' : ''}`}
          </StatusBadge>
          {p.firstError && (
            <>
              <Row icon={FileCheck} label="Error Line" value={String(p.firstError.line)} />
              <Row icon={FileCheck} label="Error Column" value={String(p.firstError.column)} />
            </>
          )}
          <Row icon={Hash} label="Characters" value={String(p.content.length)} />
        </>
      )
    case '/repair':
      return (
        <>
          <Row icon={Wrench} label="Repairs Applied" value={String(p.recentRepairs)} />
          <Row icon={Hash} label="Original Size" value={String(p.originalSize)} />
          <Row icon={Hash} label="Current Size" value={String(p.content.length)} />
          <StatusBadge label="Status" valid={p.hasContent} invalid={!p.hasContent} empty={false}>
            {p.hasContent ? 'Ready' : 'No content'}
          </StatusBadge>
        </>
      )
    case '/beautify':
      return (
        <>
          <Row icon={Sparkles} label="Indentation" value={`Spaces: ${p.tabSize}`} />
          <Row icon={Hash} label="Current Size" value={formatBytes(p.originalSize)} />
          <Row icon={Hash} label="Formatted Size" value={formatBytes(p.formattedSize)} />
        </>
      )
    case '/minify':
      return (
        <>
          <Row icon={Shrink} label="Original Size" value={formatBytes(p.originalSize)} />
          <Row icon={Shrink} label="Compressed Size" value={formatBytes(p.compressedSize)} />
          <Row icon={Shrink} label="Saved" value={formatBytes(p.savedBytes)} />
        </>
      )
    case '/schema':
      return (
        <>
          <Row icon={FileSearch} label="Schema Loaded" value={p.hasContent ? 'Yes' : 'No'} />
          <Row icon={FileCheck} label="JSON Validity" value={p.hasContent && p.errorCount === 0 ? 'Valid' : p.hasContent ? `${p.errorCount} error(s)` : '-'} />
        </>
      )
    case '/diff':
      return (
        <>
          <Row icon={GitCompare} label="Added Lines" value={String(p.diffStats.added)} />
          <Row icon={GitCompare} label="Removed Lines" value={String(p.diffStats.removed)} />
          <Row icon={GitCompare} label="Modified Lines" value={String(p.diffStats.modified)} />
        </>
      )
    case '/history':
      return (
        <>
          <Row icon={History} label="Total Entries" value={String(p.historyEntries.length)} />
          <Row icon={History} label="Can Undo" value={p.historyEntries.length > 1 ? 'Yes' : 'No'} />
        </>
      )
    case '/settings':
      return (
        <>
          <Row icon={Settings} label="Theme" value={p.theme} />
          <Row icon={Type} label="Font Size" value={`${p.fontSize}px`} />
          <Row icon={Hash} label="Tab Width" value={`${p.tabSize} spaces`} />
        </>
      )
    default:
      return (
        <p className="text-[12px] text-text-muted leading-relaxed">
          Validate, repair and format your JSON files. All processing is done locally — nothing leaves your machine.
        </p>
      )
  }
}

function Row({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between h-7">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-text-muted shrink-0" />
        <span className="text-text-secondary text-[13px]">{label}</span>
      </div>
      <span className="text-text font-medium text-[13px]">{value}</span>
    </div>
  )
}

function StatusBadge({ label, valid, invalid, empty, children }: {
  label: string; valid: boolean; invalid: boolean; empty: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between h-7">
      <div className="flex items-center gap-2">
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', empty && 'bg-text-muted', valid && 'bg-success', invalid && 'bg-danger')} />
        <span className="text-text-secondary text-[13px]">{label}</span>
      </div>
      <span className={cn('font-medium text-[13px]', empty && 'text-text-muted', valid && 'text-success', invalid && 'text-danger')}>{children}</span>
    </div>
  )
}

function Section({ title, open, onToggle, children }: {
  title: string; open?: boolean; onToggle?: (v: boolean) => void; children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(true)
  const isOpen = onToggle !== undefined ? (open ?? true) : internalOpen
  const handleToggle = () => { if (onToggle) onToggle(!isOpen); else setInternalOpen(!isOpen) }

  return (
    <div className="rounded-lg bg-surface border border-border overflow-hidden">
      <button onClick={handleToggle} className="flex items-center justify-between w-full hover:bg-surface-hover transition-colors px-3 py-2.5">
        <span className="text-text font-medium text-[13px]">{title}</span>
        {isOpen ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
      </button>
      {isOpen && <div className="px-3 pb-2.5 flex flex-col gap-0.5">{children}</div>}
    </div>
  )
}
