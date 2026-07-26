import type { JsonStatistics } from '@/types/json'

const MAX_TRAVERSAL_DEPTH = 500
const MAX_NODES = 50000

export function computeStatistics(json: string): JsonStatistics | null {
  try {
    const parsed = JSON.parse(json)
    const stats: JsonStatistics = {
      objects: 0,
      arrays: 0,
      keys: 0,
      strings: 0,
      numbers: 0,
      booleans: 0,
      nulls: 0,
      maxDepth: 0,
      duplicateKeys: [],
      characters: json.length,
      lines: json.split('\n').length,
      size: new Blob([json]).size,
    }

    const seenKeys = new Map<string, number>()
    let nodeCount = 0

    function traverse(value: unknown, depth: number) {
      if (depth > MAX_TRAVERSAL_DEPTH || nodeCount > MAX_NODES) return
      nodeCount++
      stats.maxDepth = Math.max(stats.maxDepth, depth)
      if (value === null) { stats.nulls++; return }
      if (typeof value === 'string') { stats.strings++; return }
      if (typeof value === 'number') { stats.numbers++; return }
      if (typeof value === 'boolean') { stats.booleans++; return }
      if (Array.isArray(value)) {
        stats.arrays++
        for (let i = 0; i < value.length; i++) {
          traverse(value[i], depth + 1)
        }
        return
      }
      if (typeof value === 'object') {
        stats.objects++
        const entries = Object.entries(value as Record<string, unknown>)
        for (let i = 0; i < entries.length; i++) {
          const [k, v] = entries[i]
          stats.keys++
          const count = seenKeys.get(k) ?? 0
          seenKeys.set(k, count + 1)
          traverse(v, depth + 1)
        }
      }
    }
    traverse(parsed, 0)

    seenKeys.forEach((count, key) => {
      if (count > 1) stats.duplicateKeys.push(key)
    })

    return stats
  } catch {
    return null
  }
}
