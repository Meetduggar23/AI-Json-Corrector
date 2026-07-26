import type { ValidationError } from '@/types/json'

interface ParsedError {
  line: number
  column: number
  message: string
  suggestion?: string
}

function parseError(message: string, json?: string): ParsedError | null {
  const match = message.match(/position\s+(\d+)/i)
  if (!match) return null

  const pos = parseInt(match[1])
  const content = json ?? message
  const line = (content.substring(0, pos).match(/\n/g) || []).length + 1
  const lastNewline = content.substring(0, pos).lastIndexOf('\n')
  const column = pos - (lastNewline === -1 ? 0 : lastNewline)

  const cleanMessage = message
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    line,
    column: Math.max(1, column),
    message: cleanMessage,
    suggestion: getSuggestion(message),
  }
}

export function validateJson(json: string): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!json.trim()) {
    return { valid: true, errors: [] }
  }

  try {
    JSON.parse(json)
    return { valid: true, errors: [] }
  } catch (e) {
    const message = (e as Error).message

    const errorMsg = parseError(message, json)
    if (errorMsg) {
      errors.push({
        line: errorMsg.line,
        column: errorMsg.column,
        message: errorMsg.message,
        type: 'syntax',
        suggestion: errorMsg.suggestion,
      })
    } else {
      errors.push({
        line: 1,
        column: 1,
        message,
        type: 'syntax',
        suggestion: getSuggestion(message),
      })
    }

    return { valid: false, errors }
  }
}

function getSuggestion(msg: string): string | undefined {
  if (msg.includes('Expected comma') || msg.includes('missing') && msg.includes(',')) {
    return 'Insert a comma at the reported position'
  }
  if (msg.includes('Expected double-quoted') || msg.includes('Unterminated string')) {
    return 'Add closing quotation mark'
  }
  if (msg.includes('Unexpected token') || msg.includes('Unexpected identifier')) {
    return 'Check for extra or invalid characters'
  }
  if (msg.includes('trailing comma') || msg.includes('extra comma')) {
    return 'Remove the trailing comma'
  }
  if (msg.includes('Expected \']\'')) {
    return 'Add closing bracket ]'
  }
  if (msg.includes('Expected \'}\'')) {
    return 'Add closing brace }'
  }
  if (msg.includes('not a valid JSON')) {
    return 'Ensure the content is valid JSON format'
  }
  if (msg.includes('Invalid escape')) {
    return 'Fix the invalid escape character'
  }
  if (msg.includes('Duplicate key')) {
    return 'Remove or rename duplicate key'
  }
  return undefined
}
