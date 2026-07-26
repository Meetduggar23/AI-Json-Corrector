import { useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { autoRepair, repairJson, quickFixInsertComma, quickFixRemoveTrailingComma, quickFixAddQuotes, quickFixRemoveInvalid } from '@/services/repair'
import { computeStatistics } from '@/utils/statistics'
import { generateId } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'
import type { RepairResult } from '@/types/json'

export function useRepair() {
  const { setContent, setOriginalContent, setStatistics, addConsoleEntry, pushHistory, content } = useEditorStore()

  const repair = useCallback((value: string, useAutoRepair = false): RepairResult => {
    const result = useAutoRepair ? autoRepair(value) : repairJson(value)

    if (result.success && result.corrected !== value) {
      setContent(result.corrected)
      setOriginalContent(value)
      pushHistory({
        id: generateId(),
        content: result.corrected,
        timestamp: Date.now(),
        label: useAutoRepair ? 'Auto repair' : 'Repair',
      })

      const stats = computeStatistics(result.corrected)
      if (stats) setStatistics(stats)

      trackActivity({ type: 'repair', label: 'Repaired JSON', path: '/repair' })
      addConsoleEntry({
        id: generateId(),
        type: 'success',
        message: `✓ JSON repaired successfully (${result.repairs.length} fixes)`,
        timestamp: Date.now(),
        details: result.repairs.map(r => `• ${r.description}`).join('\n'),
      })
    } else if (result.success) {
      addConsoleEntry({
        id: generateId(),
        type: 'info',
        message: '✓ JSON is already valid - no repair needed',
        timestamp: Date.now(),
      })
    } else {
      addConsoleEntry({
        id: generateId(),
        type: 'error',
        message: '✗ Repair failed - could not fix JSON',
        timestamp: Date.now(),
      })
    }

    return result
  }, [setContent, setOriginalContent, setStatistics, addConsoleEntry, pushHistory])

  const applyQuickFix = useCallback((fix: string) => {
    let result = content
    switch (fix) {
      case 'comma': result = quickFixInsertComma(content); break
      case 'trailing': result = quickFixRemoveTrailingComma(content); break
      case 'quotes': result = quickFixAddQuotes(content); break
      case 'invalid': result = quickFixRemoveInvalid(content); break
    }
    setContent(result)
    pushHistory({
      id: generateId(),
      content: result,
      timestamp: Date.now(),
      label: `Quick fix: ${fix}`,
    })
  }, [content, setContent, pushHistory])

  return { repair, applyQuickFix }
}
