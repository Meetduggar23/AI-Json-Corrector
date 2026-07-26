import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { validateJson } from '@/services/validator'
import { computeStatistics } from '@/utils/statistics'
import { generateId, debounce } from '@/utils/helpers'
import { trackActivity } from '@/utils/activity'

export function useValidator() {
  const { setValidationErrors, setStatistics, addConsoleEntry } = useEditorStore()
  const lastValidated = useRef('')

  const validate = useCallback((content: string): boolean => {
    if (!content.trim()) {
      setValidationErrors([])
      setStatistics(null)
      return true
    }

    const start = performance.now()
    const result = validateJson(content)
    const elapsed = ((performance.now() - start) / 1000).toFixed(3)

    const stats = result.valid ? computeStatistics(content) : null
    setValidationErrors(result.errors)
    setStatistics(stats)

    if (result.valid) {
      trackActivity({ type: 'validate', label: 'Validated JSON', path: '/validator' })
      addConsoleEntry({
        id: generateId(),
        type: 'success',
        message: `✓ JSON is valid (${elapsed}s)`,
        timestamp: Date.now(),
      })
    } else {
      trackActivity({ type: 'validate', label: 'JSON validation failed', path: '/validator' })
      addConsoleEntry({
        id: generateId(),
        type: 'error',
        message: `✗ ${result.errors.length} validation error(s) found (${elapsed}s)`,
        timestamp: Date.now(),
        details: result.errors.map(e => `Line ${e.line}:${e.column} - ${e.message}`).join('\n'),
      })
    }
    return result.valid
  }, [setValidationErrors, setStatistics, addConsoleEntry])

  const debouncedValidate = useRef(
    debounce((content: unknown) => validate(content as string), 500)
  ).current

  return { validate, debouncedValidate }
}
