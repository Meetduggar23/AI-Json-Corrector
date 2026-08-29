import { useState, useCallback, useRef } from 'react'

interface RunResult {
  success: boolean
  message: string
  duration: number
}

export function useRunAction() {
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState<RunResult | null>(null)
  const lockRef = useRef(false)

  const execute = useCallback(async (action: () => Promise<RunResult> | RunResult) => {
    if (lockRef.current) return
    lockRef.current = true
    setRunning(true)
    try {
      const start = performance.now()
      const result = await action()
      const duration = performance.now() - start
      setLastResult({ ...result, duration })
    } catch (e) {
      setLastResult({ success: false, message: (e as Error).message, duration: 0 })
    } finally {
      setRunning(false)
      lockRef.current = false
    }
  }, [])

  return { running, lastResult, execute }
}
