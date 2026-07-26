import { useState, useCallback } from 'react'
import { validateWithSchema } from '@/services/schema'
import type { SchemaValidationResult } from '@/types/schema'

export function useSchema() {
  const [schema, setSchema] = useState('')
  const [result, setResult] = useState<SchemaValidationResult | null>(null)
  const [isValidSchema, setIsValidSchema] = useState(true)

  const loadSchema = useCallback((value: string) => {
    setSchema(value)
    try {
      JSON.parse(value)
      setIsValidSchema(true)
    } catch {
      setIsValidSchema(false)
    }
  }, [])

  const validate = useCallback((json: string) => {
    if (!schema.trim()) return
    const r = validateWithSchema(json, schema)
    setResult(r)
  }, [schema])

  const clear = useCallback(() => {
    setSchema('')
    setResult(null)
  }, [])

  return { schema, result, isValidSchema, loadSchema, validate, clear }
}
