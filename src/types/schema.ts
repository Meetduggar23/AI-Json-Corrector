export interface SchemaValidationResult {
  valid: boolean
  errors: SchemaError[]
}

export interface SchemaError {
  path: string
  message: string
  keyword: string
  params?: Record<string, unknown>
}
