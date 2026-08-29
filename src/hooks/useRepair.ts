import { useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { autoRepair, repairJson, quickFixInsertComma, quickFixRemoveTrailingComma, quickFixAddQuotes, quickFixRemoveInvalid } from '@/services/repair'
import { computeStatistics } from '@/utils/statistics'
import { generateId } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'
import type { RepairResult } from '@/types/json'

export function useRepair() {
  const repair = useCallback((value: string, useAutoRepair = false): RepairResult => {
    const result = useAutoRepair ? autoRepair(value) : repairJson(value)
    const store = useEditorStore.getState()

    if (result.success && result.corrected !== value) {
      store.setContent(result.corrected)
      store.setOriginalContent(value)
      store.pushHistory({
        id: generateId(),
        content: result.corrected,
        timestamp: Date.now(),
        label: useAutoRepair ? 'Auto repair' : 'Repair',
      })

      const stats = computeStatistics(result.corrected)
      if (stats) store.setStatistics(stats)

      trackActivity({ type: 'repair', label: 'Repaired JSON', path: '/repair' })
      store.addConsoleEntry({
        id: generateId(),
        type: 'success',
        message: `✓ JSON repaired successfully (${result.repairs.length} fixes)`,
        timestamp: Date.now(),
        details: result.repairs.map(r => `• ${r.description}`).join('\n'),
      })
    } else if (result.success) {
      store.addConsoleEntry({
        id: generateId(),
        type: 'info',
        message: '✓ JSON is already valid - no repair needed',
        timestamp: Date.now(),
      })
    } else {
      store.addConsoleEntry({
        id: generateId(),
        type: 'error',
        message: '✗ Repair failed - could not fix JSON',
        timestamp: Date.now(),
      })
    }

    return result
  }, [])

  const applyQuickFix = useCallback((fix: string) => {
    const store = useEditorStore.getState()
    const currentContent = store.content
    let result = currentContent
    switch (fix) {
      case 'comma': result = quickFixInsertComma(currentContent); break
      case 'trailing': result = quickFixRemoveTrailingComma(currentContent); break
      case 'quotes': result = quickFixAddQuotes(currentContent); break
      case 'invalid': result = quickFixRemoveInvalid(currentContent); break
    }
    store.setContent(result)
    store.pushHistory({
      id: generateId(),
      content: result,
      timestamp: Date.now(),
      label: `Quick fix: ${fix}`,
    })
  }, [])

  return { repair, applyQuickFix }
}
