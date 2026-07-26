import { generateId } from './helpers'

export interface ActivityEntry {
  id: string
  type: 'validate' | 'repair' | 'beautify' | 'minify' | 'schema' | 'diff' | 'open' | 'format'
  label: string
  path: string
  timestamp: number
}

const STORAGE_KEY = 'json-corrector-activity'

export function trackActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const activities: ActivityEntry[] = raw ? JSON.parse(raw) : []
    activities.unshift({ ...entry, id: generateId(), timestamp: Date.now() })
    if (activities.length > 50) activities.length = 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
  } catch {}
}

export function getActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}
