import { saveAs } from 'file-saver'

export function downloadJson(content: string, filename = 'corrected.json') {
  const blob = new Blob([content], { type: 'application/json' })
  saveAs(blob, filename)
}

export function downloadAsText(content: string, filename = 'output.txt') {
  const blob = new Blob([content], { type: 'text/plain' })
  saveAs(blob, filename)
}
