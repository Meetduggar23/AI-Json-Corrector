import { useCallback, useEffect, useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { useTheme } from '@/hooks/useTheme'
import { setEditorApi } from '@/utils/editorApi'

export function MonacoEditor() {
  const content = useEditorStore((s) => s.content)
  const setContent = useEditorStore((s) => s.setContent)
  const validationErrors = useEditorStore((s) => s.validationErrors)
  const { fontSize, wordWrap, tabSize, minimap, lineNumbers } = useSettingsStore()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco
    setEditorApi(editor, monaco)
  }, [])

  const handleChange = useCallback((value: string | undefined) => {
    setContent(value ?? '')
  }, [setContent])

  useEffect(() => {
    const { editor: ed, monaco: mon } = editorRef.current && monacoRef.current
      ? { editor: editorRef.current, monaco: monacoRef.current }
      : { editor: null, monaco: null }
    if (!ed || !mon) return
    const model = ed.getModel()
    if (!model) return
    if (validationErrors.length === 0) {
      monacoRef.current?.editor.setModelMarkers(model, 'json-corrector', [])
    } else {
      monacoRef.current?.editor.setModelMarkers(model, 'json-corrector', validationErrors.map(e => ({
        severity: monacoRef.current.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: e.line,
        startColumn: e.column,
        endLineNumber: e.line,
        endColumn: e.column + 1,
      })))
    }
  }, [validationErrors])

  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs'

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-muted text-xs">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <Editor
        key={monacoTheme}
        height="100%"
        defaultLanguage="json"
        theme={monacoTheme}
        value={content}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize,
          wordWrap,
          tabSize,
          minimap: { enabled: minimap },
          lineNumbers,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          renderWhitespace: 'selection',
          padding: { top: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  )
}
