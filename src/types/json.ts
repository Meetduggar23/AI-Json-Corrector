export interface ValidationError {
  line: number
  column: number
  message: string
  type: 'syntax' | 'schema' | 'repair'
  suggestion?: string
}

export interface JsonStatistics {
  objects: number
  arrays: number
  keys: number
  strings: number
  numbers: number
  booleans: number
  nulls: number
  maxDepth: number
  duplicateKeys: string[]
  characters: number
  lines: number
  size: number
}

export interface JsonNode {
  key: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  depth: number
  path: string
  children?: JsonNode[]
}

export interface RepairResult {
  original: string
  corrected: string
  repairs: RepairAction[]
  success: boolean
}

export interface RepairAction {
  type: 'insert' | 'remove' | 'replace'
  description: string
  position?: { line: number; column: number }
}

export interface HistoryEntry {
  id: string
  content: string
  timestamp: number
  label: string
}

export interface RunEntry {
  id: string
  timestamp: number
  success: boolean
  duration: number
  errorCount: number
  fileName: string
}
