import { create } from 'zustand'
import type { ValidationError, JsonStatistics, HistoryEntry, RunEntry } from '@/types/json'
import type { ConsoleEntry, EditorSettings } from '@/types/editor'

interface RecentFile {
  id: string
  name: string
  content: string
  status: 'valid' | 'invalid'
  size: number
  timestamp: number
}

interface EditorState {
  content: string
  originalContent: string
  fileName: string
  validationErrors: ValidationError[]
  statistics: JsonStatistics | null
  consoleEntries: ConsoleEntry[]
  history: HistoryEntry[]
  historyIndex: number
  isSidebarOpen: boolean
  isRightPanelOpen: boolean
  bottomTab: 'problems' | 'output' | 'logs' | 'history' | 'schema'
  isRunning: boolean
  runHistory: RunEntry[]

  setContent: (content: string) => void
  setOriginalContent: (content: string) => void
  setFileName: (name: string) => void
  renameFile: (oldName: string, newName: string) => void
  setValidationErrors: (errors: ValidationError[]) => void
  setStatistics: (stats: JsonStatistics | null) => void
  addConsoleEntry: (entry: ConsoleEntry) => void
  clearConsole: () => void
  pushHistory: (entry: HistoryEntry) => void
  undo: () => void
  redo: () => void
  toggleSidebar: () => void
  toggleRightPanel: () => void
  setBottomTab: (tab: 'problems' | 'output' | 'logs' | 'history' | 'schema') => void
  clearHistory: () => void
  setRunning: (running: boolean) => void
  pushRunEntry: (entry: RunEntry) => void
}

const RECENT_FILES_KEY = 'json-corrector-recent-files'
const RUN_HISTORY_KEY = 'json-corrector-run-history'

function loadRunHistory(): RunEntry[] {
  try {
    const raw = localStorage.getItem(RUN_HISTORY_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: '',
  originalContent: '',
  fileName: 'untitled.json',
  validationErrors: [],
  statistics: null,
  consoleEntries: [],
  history: [],
  historyIndex: -1,
  isSidebarOpen: true,
  isRightPanelOpen: true,
  bottomTab: 'problems',
  isRunning: false,
  runHistory: loadRunHistory(),

  setContent: (content) => set((state) => ({
    content,
    originalContent: state.originalContent || content,
  })),
  setOriginalContent: (content) => set({ originalContent: content }),
  setFileName: (name) => {
    set({ fileName: name })
    document.title = `${name} - JSON Corrector`
  },
  renameFile: (oldName, newName) => {
    set({ fileName: newName })
    document.title = `${newName} - JSON Corrector`
    try {
      const raw = localStorage.getItem(RECENT_FILES_KEY)
      if (raw) {
        const files: RecentFile[] = JSON.parse(raw)
        const idx = files.findIndex(f => f.name === oldName)
        if (idx !== -1) {
          files[idx].name = newName
          localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files))
        }
      }
    } catch {}
  },
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setStatistics: (stats) => set({ statistics: stats }),

  addConsoleEntry: (entry) =>
    set((state) => ({
      consoleEntries: [...state.consoleEntries.slice(-99), entry],
    })),

  clearConsole: () => set({ consoleEntries: [] }),

  pushHistory: (entry) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(entry)
      if (newHistory.length > 20) newHistory.shift()
      return { history: newHistory, historyIndex: newHistory.length - 1 }
    }),

  undo: () => {
    const { historyIndex, history, content: currentContent } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      if (newIndex === 0) {
        set({ content: history[newIndex].content, originalContent: '', historyIndex: newIndex })
      } else {
        set({ content: history[newIndex].content, originalContent: currentContent, historyIndex: newIndex })
      }
    }
  },

  redo: () => {
    const { historyIndex, history, content: currentContent } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({ content: history[newIndex].content, originalContent: currentContent, historyIndex: newIndex })
    }
  },

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleRightPanel: () => set((s) => ({ isRightPanelOpen: !s.isRightPanelOpen })),
  setBottomTab: (tab) => set({ bottomTab: tab }),
  clearHistory: () => set({ history: [], historyIndex: -1 }),
  setRunning: (running) => set({ isRunning: running }),
  pushRunEntry: (entry) => set((state) => {
    const updated = [entry, ...state.runHistory].slice(0, 20)
    try { localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(updated)) } catch {}
    return { runHistory: updated }
  }),
}))

interface SettingsState extends EditorSettings {
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void
  resetSettings: () => void
}

const defaultSettings: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'on',
  autoFormat: true,
  autoRepair: false,
  tabSize: 2,
  indentStyle: 'spaces',
  animations: true,
  minimap: true,
  lineNumbers: 'on',
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,
  updateSetting: (key, value) => set({ [key]: value }),
  resetSettings: () => set(defaultSettings),
}))
