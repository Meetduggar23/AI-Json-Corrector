import { jsonrepair } from 'jsonrepair'
import type { RepairResult, RepairAction } from '@/types/json'

type StringMap = Map<string, string>

function extractStrings(json: string): { cleaned: string; map: StringMap } {
  const map: StringMap = new Map()
  let counter = 0
  const cleaned = json.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, (match) => {
    const placeholder = `__STR${counter}__`
    map.set(placeholder, match)
    counter++
    return placeholder
  })
  return { cleaned, map }
}

function restoreStrings(cleaned: string, map: StringMap): string {
  let result = cleaned
  for (const [placeholder, original] of map) {
    result = result.replace(placeholder, original)
  }
  return result
}

export function repairJson(json: string): RepairResult {
  const repairs: RepairAction[] = []

  if (!json.trim()) {
    return { original: json, corrected: json, repairs: [], success: true }
  }

  try {
    JSON.parse(json)
    return { original: json, corrected: json, repairs: [], success: true }
  } catch {
    // Continue to repair
  }

  try {
    const corrected = jsonrepair(json)
    repairs.push({
      type: 'replace',
      description: 'Applied automatic JSON repair',
    })
    return { original: json, corrected, repairs, success: true }
  } catch (e) {
    repairs.push({
      type: 'replace',
      description: `Repair failed: ${(e as Error).message}`,
    })
    return { original: json, corrected: json, repairs, success: false }
  }
}

export function quickFixRemoveTrailingComma(json: string): string {
  const { cleaned, map } = extractStrings(json)
  const result = cleaned.replace(/,\s*([}\]])/g, '$1')
  return restoreStrings(result, map)
}

export function quickFixAddQuotes(json: string): string {
  const { cleaned, map } = extractStrings(json)
  const result = cleaned.replace(/(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  return restoreStrings(result, map)
}

export function quickFixRemoveInvalid(json: string): string {
  const { cleaned, map } = extractStrings(json)
  const result = cleaned
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // eslint-disable-line no-control-regex
    .replace(/\/\/.*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  return restoreStrings(result, map)
}

export function quickFixInsertComma(json: string): string {
  const { cleaned, map } = extractStrings(json)
  const lines = cleaned.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (
      line.endsWith('}') || line.endsWith(']') ||
      line.endsWith('"') || line.endsWith('true') ||
      line.endsWith('false') || line.endsWith('null') ||
      /\d$/.test(line)
    ) {
      const nextLine = lines[i + 1]?.trim()
      if (nextLine && (nextLine.startsWith('"') || nextLine.startsWith('{'))) {
        if (!line.endsWith(',') && !line.endsWith('{') && !line.endsWith('[')) {
          lines[i] = lines[i] + ','
        }
      }
    }
  }
  return restoreStrings(lines.join('\n'), map)
}

export function autoRepair(json: string): RepairResult {
  let result = json
  const repairs: RepairAction[] = []

  if (!json.trim()) {
    return { original: json, corrected: json, repairs: [], success: true }
  }

  try {
    JSON.parse(result)
    return { original: json, corrected: result, repairs: [], success: true }
  } catch {
    // Try progressive repairs
  }

  const steps: { name: string; fn: (s: string) => string }[] = [
    { name: 'Removed invalid characters', fn: quickFixRemoveInvalid },
    { name: 'Removed trailing commas', fn: quickFixRemoveTrailingComma },
    { name: 'Inserted missing commas', fn: quickFixInsertComma },
    { name: 'Added quotes to keys', fn: quickFixAddQuotes },
  ]

  for (const step of steps) {
    const before = result
    result = step.fn(result)
    if (before !== result) {
      repairs.push({ type: 'replace', description: step.name })
    }
    try {
      JSON.parse(result)
      return { original: json, corrected: result, repairs, success: true }
    } catch {
      continue
    }
  }

  try {
    const corrected = jsonrepair(result)
    repairs.push({ type: 'replace', description: 'Applied jsonrepair library' })
    return { original: json, corrected, repairs, success: true }
  } catch {
    return { original: json, corrected: result, repairs, success: false }
  }
}
