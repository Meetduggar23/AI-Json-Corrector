export type EditorTheme = 'vs-dark' | 'vs' | 'hc-black'
export type TabSize = 2 | 4 | 8
export type IndentStyle = 'spaces' | 'tab'

export interface EditorSettings {
  theme: EditorTheme
  fontSize: number
  wordWrap: 'on' | 'off'
  autoFormat: boolean
  autoRepair: boolean
  tabSize: TabSize
  indentStyle: IndentStyle
  animations: boolean
  minimap: boolean
  lineNumbers: 'on' | 'off' | 'relative'
}

export interface ConsoleEntry {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
  details?: string
}
