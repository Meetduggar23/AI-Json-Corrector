import type { ValidationError } from '@/types/json'
import { jsonrepair } from 'jsonrepair'
import { diffArrays } from 'diff'

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
  if (!json.trim()) {
    return { valid: true, errors: [] }
  }

  try {
    JSON.parse(json)
    return { valid: true, errors: [] }
  } catch (e) {
    const errors: ValidationError[] = []

    const firstError = parseError((e as Error).message, json)
    if (firstError) {
      errors.push({
        line: firstError.line,
        column: firstError.column,
        message: firstError.message,
        type: 'syntax',
        suggestion: firstError.suggestion,
      })
    }

    try {
      const corrected = jsonrepair(json)
      if (corrected !== json) {
        const origLines = json.split('\n')
        const changes = diffArrays(origLines, corrected.split('\n'))
        let origLineNum = 0
        for (const change of changes) {
          if (change.removed && change.count) {
            for (let i = 0; i < change.count; i++) {
              const lineNum = origLineNum + i + 1
              if (!errors.some(e => e.line === lineNum)) {
                errors.push({
                  line: lineNum,
                  column: 1,
                  message: `Syntax error near line ${lineNum}`,
                  type: 'syntax',
                  suggestion: 'Check this line for issues',
                })
              }
            }
          }
          if (change.count) {
            if (change.removed) origLineNum += change.count
            else if (!change.added) origLineNum += change.count
          }
        }
      }
    } catch {}

    if (errors.length === 0) {
      errors.push({
        line: 1, column: 1,
        message: (e as Error).message,
        type: 'syntax',
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
