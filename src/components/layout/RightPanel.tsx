import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn, formatBytes } from '@/utils/helpers'

export function RightPanel() {
  const { content, validationErrors, statistics, fileName } = useEditorStore()

  const [docOpen, setDocOpen] = useState(true)
  const [statsOpen, setStatsOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [shortcutsOpen, setShortcutsOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)

  const hasContent = content.trim().length > 0
  const isValid = hasContent && validationErrors.length === 0

  const lastRun = useMemo(() => {
    if (!hasContent) return null
    const entries = useEditorStore.getState().runHistory
    return entries[0]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasContent, validationErrors.length])

  return (
    <div className="h-full bg-panel overflow-y-auto flex flex-col w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">INSPECTOR</span>
      </div>

      <Section title="DOCUMENT" open={docOpen} onToggle={setDocOpen}>
        <Row label="Filename" value={fileName || 'untitled.json'} />
        <Row label="Path" value="/Documents" />
        <Row label="Size" value={formatBytes(content.length)} />
        <Row label="Last Modified" value={lastRun ? `${lastRun.duration}ms` : 'just now'} />
      </Section>

      <Section title="STATISTICS" open={statsOpen} onToggle={setStatsOpen}>
        {statistics ? (
          <>
            <Row label="Objects" value={String(statistics.objects)} />
            <Row label="Arrays" value={String(statistics.arrays)} />
            <Row label="Keys" value={String(statistics.keys)} highlight />
            <Row label="String Values" value={String(statistics.strings)} />
            <Row label="Number Values" value={String(statistics.numbers)} />
            <Row label="Boolean Values" value={String(statistics.booleans)} />
            <Row label="Null Values" value={String(statistics.nulls)} />
            <Row label="Max Depth" value={String(statistics.maxDepth)} />
          </>
        ) : (
          <p className="text-[11px] text-text-muted py-2">Run validation to see statistics.</p>
        )}
      </Section>

      <Section title="JSON STATUS" open={statusOpen} onToggle={setStatusOpen}>
        {!hasContent ? (
          <div className="py-2">
            <p className="text-[11px] text-text-muted">No Document</p>
          </div>
        ) : isValid ? (
          <div className="py-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success shadow-sm shadow-success/50" />
              <span className="text-[12px] font-semibold text-success">Valid JSON</span>
            </div>
            <p className="text-[11px] text-text-secondary">The JSON is valid and well-formed.</p>
            {lastRun && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">Validation Time</span>
                  <span className="text-[10px] text-text-secondary">{lastRun.duration}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">Last Run</span>
                  <span className="text-[10px] text-text-secondary">just now</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-danger shadow-sm shadow-danger/50" />
              <span className="text-[12px] font-semibold text-danger">Invalid JSON</span>
            </div>
            <p className="text-[11px] text-text-secondary">{validationErrors.length} problem{validationErrors.length !== 1 ? 's' : ''} found.</p>
            {lastRun && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">Validation Time</span>
                  <span className="text-[10px] text-text-secondary">{lastRun.duration}ms</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="INSPECTOR" open={inspectorOpen} onToggle={setInspectorOpen}>
        {!hasContent ? (
          <p className="text-[11px] text-text-muted py-2">Paste a JSON document or open a file to see details.</p>
        ) : (
          <div className="py-1 space-y-1">
            <Row label="Type" value={(() => { try { const v = JSON.parse(content); return Array.isArray(v) ? 'array' : typeof v } catch { return 'invalid' } })()} />
            <Row label="Characters" value={String(content.length)} />
            <Row label="Lines" value={String(content.split('\n').length)} />
          </div>
        )}
      </Section>

      <Section title="KEYBOARD SHORTCUTS" open={shortcutsOpen} onToggle={setShortcutsOpen}>
        {[
          { label: 'Run Validation', key: 'Ctrl+Enter' },
          { label: 'Save File', key: 'Ctrl+S' },
          { label: 'Search', key: 'Ctrl+F' },
          { label: 'Beautify JSON', key: 'Ctrl+Shift+B' },
          { label: 'Minify JSON', key: 'Ctrl+Shift+M' },
          { label: 'Repair JSON', key: 'Ctrl+R' },
          { label: 'Download', key: 'Ctrl+D' },
          { label: 'Rename File', key: 'F2' },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between h-[26px]">
            <span className="text-[11px] text-text-secondary">{s.label}</span>
            <kbd className="text-[10px] text-text-muted bg-surface border border-border px-1.5 py-0.5 font-mono">{s.key}</kbd>
          </div>
        ))}
      </Section>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between h-[26px]">
      <span className="text-text-secondary text-[11px]">{label}</span>
      <span className={cn('text-[11px] truncate max-w-[120px]', highlight ? 'text-primary font-semibold' : 'text-text font-medium')}>{value}</span>
    </div>
  )
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-border">
      <button
        onClick={() => onToggle(!open)}
        className="flex items-center gap-1.5 w-full px-3 py-2 hover:bg-surface-hover transition-colors text-left"
      >
        {open ? (
          <ChevronDown size={10} className="text-text-muted" />
        ) : (
          <ChevronRight size={10} className="text-text-muted" />
        )}
        <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">{title}</span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 flex flex-col gap-0">{children}</div>
      )}
    </div>
  )
}
