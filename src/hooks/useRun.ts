import { useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { useRepair } from '@/hooks/useRepair'
import { validateJson } from '@/services/validator'
import { computeStatistics } from '@/utils/statistics'
import { generateId } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'
import { setMarkers, clearMarkers, revealPosition } from '@/utils/editorApi'
import toast from 'react-hot-toast'

export function useRun() {
  const {
    content, setContent, setValidationErrors, setStatistics,
    addConsoleEntry, setRunning, pushRunEntry, setBottomTab, fileName,
  } = useEditorStore()
  const { autoRepair } = useSettingsStore()
  const { repair } = useRepair()

  const run = useCallback(() => {
    const start = performance.now()
    setRunning(true)
    clearMarkers()

    const trimmed = content.trim()
    if (!trimmed) {
      setRunning(false)
      toast.error('Nothing to validate')
      return
    }

    const result = validateJson(content)
    const duration = performance.now() - start
    const stats = result.valid ? computeStatistics(content) : null

    setValidationErrors(result.errors)
    setStatistics(stats)

    if (result.valid) {
      trackActivity({ type: 'validate', label: 'Run: JSON is valid', path: '/' })
      addConsoleEntry({
        id: generateId(), type: 'success',
        message: `✅ JSON is valid (${duration.toFixed(0)}ms)`,
        timestamp: Date.now(),
      })
      clearMarkers()
      toast.success('JSON is valid')
      pushRunEntry({
        id: generateId(), timestamp: Date.now(), success: true,
        duration: Math.round(duration), errorCount: 0, fileName: fileName || 'untitled.json',
      })
    } else {
      trackActivity({ type: 'validate', label: `Run: ${result.errors.length} error(s)`, path: '/' })
      addConsoleEntry({
        id: generateId(), type: 'error',
        message: `❌ Validation failed — ${result.errors.length} error(s) (${duration.toFixed(0)}ms)`,
        timestamp: Date.now(),
        details: result.errors.map(e => `L${e.line}:${e.column} - ${e.message}`).join('\n'),
      })
      setMarkers(result.errors.map(e => ({
        line: e.line, column: e.column, message: e.message, type: e.type,
      })))
      setBottomTab('problems')
      const first = result.errors[0]
      if (first) revealPosition(first.line, first.column)
      toast.error(`${result.errors.length} error(s) found`)

      pushRunEntry({
        id: generateId(), timestamp: Date.now(), success: false,
        duration: Math.round(duration), errorCount: result.errors.length,
        fileName: fileName || 'untitled.json',
      })

      if (autoRepair) {
        const repairResult = repair(content, true)
        if (repairResult.success && repairResult.corrected !== content) {
          setContent(repairResult.corrected)
          const revalidate = validateJson(repairResult.corrected)
          setValidationErrors(revalidate.errors)
          setStatistics(revalidate.valid ? computeStatistics(repairResult.corrected) : null)
          if (revalidate.valid) {
            clearMarkers()
            toast.success('✅ JSON repaired successfully')
            addConsoleEntry({
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

    setRunning(false)
  }, [content, fileName, autoRepair, setContent, setValidationErrors, setStatistics,
      addConsoleEntry, setRunning, pushRunEntry, setBottomTab, repair])

  return { run }
}
