let editorInstance: any = null
let monacoInstance: any = null

export function setEditorApi(editor: any, monaco: any) {
  editorInstance = editor
  monacoInstance = monaco
}

export function getEditorApi() {
  return { editor: editorInstance, monaco: monacoInstance }
}

export function setMarkers(markers: { line: number; column: number; message: string; type?: string }[]) {
  const { editor, monaco } = getEditorApi()
  if (!editor || !monaco) return
  const model = editor.getModel()
  if (!model) return

  monaco.editor.setModelMarkers(model, 'json-corrector', markers.map(m => ({
    severity: m.type === 'warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
    message: m.message,
    startLineNumber: m.line,
    startColumn: m.column,
    endLineNumber: m.line,
    endColumn: m.column + 1,
  })))
}

export function clearMarkers() {
  const { editor, monaco } = getEditorApi()
  if (!editor || !monaco) return
  const model = editor.getModel()
  if (!model) return
  monaco.editor.setModelMarkers(model, 'json-corrector', [])
}

export function revealPosition(line: number, column: number) {
  const { editor } = getEditorApi()
  if (!editor) return
  editor.revealPositionInCenter({ lineNumber: line, column })
  editor.setPosition({ lineNumber: line, column })
  editor.focus()
}
