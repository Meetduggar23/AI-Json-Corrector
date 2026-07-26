import { diffArrays } from 'diff'

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  value: string
  lineNumber: number
}

export interface DiffResult {
  left: DiffLine[]
  right: DiffLine[]
}

export function computeDiff(original: string, corrected: string): DiffResult {
  const origLines = original.split('\n')
  const corrLines = corrected.split('\n')

  const changes = diffArrays(origLines, corrLines)

  const left: DiffLine[] = []
  const right: DiffLine[] = []
  let origLineNum = 0
  let corrLineNum = 0

  for (const change of changes) {
    if (change.added) {
      for (const line of change.value) {
        corrLineNum++
        left.push({ type: 'unchanged', value: '', lineNumber: origLineNum })
        right.push({ type: 'added', value: line, lineNumber: corrLineNum })
      }
    } else if (change.removed) {
      for (const line of change.value) {
        origLineNum++
        left.push({ type: 'removed', value: line, lineNumber: origLineNum })
        right.push({ type: 'unchanged', value: '', lineNumber: corrLineNum })
      }
    } else {
      for (const line of change.value) {
        origLineNum++
        corrLineNum++
        left.push({ type: 'unchanged', value: line, lineNumber: origLineNum })
        right.push({ type: 'unchanged', value: line, lineNumber: corrLineNum })
      }
    }
  }

  return { left, right }
}
