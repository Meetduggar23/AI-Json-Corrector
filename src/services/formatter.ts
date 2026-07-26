export type IndentType = 2 | 4 | 8 | 'tab'

export function beautifyJson(json: string, indent: IndentType = 2): string {
  try {
    const parsed = JSON.parse(json)
    const indentStr = indent === 'tab' ? '\t' : ' '.repeat(indent as number)
    return JSON.stringify(parsed, null, indentStr)
  } catch {
    return json
  }
}

export function minifyJson(json: string): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed)
  } catch {
    return json
  }
}

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}
