import { useCallback } from 'react'
import { useEditorStore, useSettingsStore } from '@/store/editorStore'
import { useRepair } from '@/hooks/useRepair'
import { validateJson } from '@/services/validator'
import { computeStatistics } from '@/utils/statistics'
import { generateId } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'
import { setMarkers, clearMarkers, revealPosition } from '@/utils/editorApi'
import toast from 'react-hot-toast'

export function useRun() {
  const { repair } = useRepair()

  const run = useCallback(() => {
    const start = performance.now()
    const store = useEditorStore.getState()
    const settings = useSettingsStore.getState()

    store.setRunning(true)
    clearMarkers()

    const currentContent = store.content
    const trimmed = currentContent.trim()
    if (!trimmed) {
      store.setRunning(false)
      toast.error('Nothing to validate')
      return
    }

    const fileName = store.fileName || 'untitled.json'
    const result = validateJson(currentContent)
    const duration = performance.now() - start
    const stats = result.valid ? computeStatistics(currentContent) : null

    store.setValidationErrors(result.errors)
    store.setStatistics(stats)

    if (result.valid) {
      trackActivity({ type: 'validate', label: 'Run: JSON is valid', path: '/' })
      store.addConsoleEntry({
        id: generateId(), type: 'success',
        message: `✅ JSON is valid (${duration.toFixed(0)}ms)`,
        timestamp: Date.now(),
      })
      clearMarkers()
      toast.success('JSON is valid')
      store.pushRunEntry({
        id: generateId(), timestamp: Date.now(), success: true,
        duration: Math.round(duration), errorCount: 0, fileName,
      })
    } else {
      trackActivity({ type: 'validate', label: `Run: ${result.errors.length} error(s)`, path: '/' })
      store.addConsoleEntry({
        id: generateId(), type: 'error',
        message: `❌ Validation failed — ${result.errors.length} error(s) (${duration.toFixed(0)}ms)`,
        timestamp: Date.now(),
        details: result.errors.map(e => `L${e.line}:${e.column} - ${e.message}`).join('\n'),
      })
      setMarkers(result.errors.map(e => ({
        line: e.line, column: e.column, message: e.message, type: e.type,
      })))
      store.setBottomTab('problems')
      const first = result.errors[0]
      if (first) revealPosition(first.line, first.column)
      toast.error(`${result.errors.length} error(s) found`)

      store.pushRunEntry({
        id: generateId(), timestamp: Date.now(), success: false,
        duration: Math.round(duration), errorCount: result.errors.length,
        fileName,
      })

      if (settings.autoRepair) {
        const repairResult = repair(currentContent, true)
        if (repairResult.success && repairResult.corrected !== currentContent) {
          // repair() already updated store.content via setContent, re-read it
          const repairedContent = useEditorStore.getState().content
          const revalidate = validateJson(repairedContent)
          store.setValidationErrors(revalidate.errors)
          store.setStatistics(revalidate.valid ? computeStatistics(repairedContent) : null)
          if (revalidate.valid) {
            clearMarkers()
            toast.success('✅ JSON repaired successfully')
            store.addConsoleEntry({
              id: generateId(), type: 'success',
              message: '✅ JSON repaired and validated successfully',
              timestamp: Date.now(),
            })
          } else {
            setMarkers(revalidate.errors.map(e => ({
              line: e.line, column: e.column, message: e.message, type: e.type,
            })))
            toast.error('Repair partially fixed — remaining errors shown')
          }
        }
      }
    }

    store.setRunning(false)
  }, [repair])

  return { run }
}
