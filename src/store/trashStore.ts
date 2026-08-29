import { create } from 'zustand'

export interface TrashItem {
  id: string
  name: string
  content: string
  size: number
  deletedAt: number
  expiresAt: number
}

const TRASH_KEY = 'json-corrector-trash'
const TRASH_TTL = 30 * 24 * 60 * 60 * 1000

function loadTrash(): TrashItem[] {
  try {
    const raw = localStorage.getItem(TRASH_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveTrash(items: TrashItem[]) {
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(items))
  } catch {}
}

function cleanupExpired(items: TrashItem[]): TrashItem[] {
  const now = Date.now()
  return items.filter(i => i.expiresAt > now)
}

interface TrashState {
  items: TrashItem[]
  moveToTrash: (file: { id: string; name: string; content: string; size: number }) => void
  restore: (id: string) => TrashItem | null
  permanentDelete: (id: string) => void
  emptyTrash: () => void
  cleanup: () => void
}

export const useTrashStore = create<TrashState>((set, get) => ({
  items: cleanupExpired(loadTrash()),

  moveToTrash: (file) => {
    const now = Date.now()
    const item: TrashItem = {
      ...file,
      deletedAt: now,
      expiresAt: now + TRASH_TTL,
    }
    set((state) => {
      const updated = [item, ...state.items].slice(0, 50)
      saveTrash(updated)
      return { items: updated }
    })
  },

  restore: (id) => {
    const state = get()
    const item = state.items.find(i => i.id === id)
    if (!item) return null
    set((s) => {
      const updated = s.items.filter(i => i.id !== id)
      saveTrash(updated)
      return { items: updated }
    })
    return item
  },

  permanentDelete: (id) => {
    set((state) => {
      const updated = state.items.filter(i => i.id !== id)
      saveTrash(updated)
      return { items: updated }
    })
  },

  emptyTrash: () => {
    saveTrash([])
    set({ items: [] })
  },

  cleanup: () => {
    const cleaned = cleanupExpired(get().items)
    saveTrash(cleaned)
    set({ items: cleaned })
  },
}))
