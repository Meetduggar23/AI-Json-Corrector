import Ajv from 'ajv'
import type { SchemaValidationResult, SchemaError } from '@/types/schema'

const ajv = new Ajv({ allErrors: true, verbose: true })

export function validateWithSchema(json: string, schema: string): SchemaValidationResult {
  try {
    const data = JSON.parse(json)
    const schemaObj = JSON.parse(schema)
    const validate = ajv.compile(schemaObj)
    const valid = validate(data)

    if (valid) {
      return { valid: true, errors: [] }
    }

    const errors: SchemaError[] = (validate.errors || []).map((err) => ({
      path: err.instancePath || '/',
      message: err.message || 'Unknown error',
      keyword: err.keyword,
      params: err.params,
    }))

    return { valid: false, errors }
  } catch (e) {
    return {
      valid: false,
      errors: [
        {
          path: '/',
          message: `Failed to parse: ${(e as Error).message}`,
          keyword: 'parse',
        },
      ],
    }
  }
}
