export type ShortcutAction =
  | 'save'
  | 'open'
  | 'search'
  | 'replace'
  | 'undo'
  | 'redo'
  | 'format'
  | 'validate'
  | 'repair'
  | 'minify'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: ShortcutAction
  label: string
}

export const shortcuts: Shortcut[] = [
  { key: 's', ctrl: true, action: 'save', label: 'Save' },
  { key: 'o', ctrl: true, action: 'open', label: 'Open File' },
  { key: 'f', ctrl: true, action: 'search', label: 'Search' },
  { key: 'h', ctrl: true, action: 'replace', label: 'Replace' },
  { key: 'z', ctrl: true, action: 'undo', label: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', label: 'Redo' },
  { key: 'f', ctrl: true, shift: true, action: 'format', label: 'Format' },
  { key: 'v', ctrl: true, alt: true, action: 'validate', label: 'Validate' },
  { key: 'r', ctrl: true, alt: true, action: 'repair', label: 'Repair' },
  { key: 'm', ctrl: true, alt: true, action: 'minify', label: 'Minify' },
]

export function getShortcutLabel(action: ShortcutAction): string {
  const shortcut = shortcuts.find((s) => s.action === action)
  if (!shortcut) return ''
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(shortcut.key.toUpperCase())
  return parts.join(' + ')
}

export function matchShortcut(e: KeyboardEvent): ShortcutAction | null {
  for (const shortcut of shortcuts) {
    const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey)
    const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
    const altMatch = shortcut.alt ? e.altKey : !e.altKey
    if (ctrlMatch && shiftMatch && altMatch && e.key.toLowerCase() === shortcut.key) {
      return shortcut.action
    }
  }
  return null
}
