import { useCallback, useEffect, useState, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { setEditorApi } from '@/utils/editorApi'
import type { editor } from 'monaco-editor'

export function MonacoEditor() {
  const content = useEditorStore((s) => s.content)
  const setContent = useEditorStore((s) => s.setContent)
  const validationErrors = useEditorStore((s) => s.validationErrors)
  const { fontSize, wordWrap, tabSize, minimap, lineNumbers, theme: editorTheme } = useSettingsStore()
  const [mounted, setMounted] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    setEditorApi(editor, monaco)
    setEditorReady(true)
  }, [])

  useEffect(() => {
    const handler = () => {
      const ed = editorRef.current
      if (ed) {
        const findAction = ed.getAction('actions.find')
        if (findAction) findAction.run()
      }
    }
    window.addEventListener('editor:search', handler)
    return () => window.removeEventListener('editor:search', handler)
  }, [])

  const handleChange = useCallback((value: string | undefined) => {
    setContent(value ?? '')
  }, [setContent])

  useEffect(() => {
    const ed = editorRef.current
    const mon = monacoRef.current
    if (!ed || !mon) return
    const model = ed.getModel()
    if (!model) return
    if (validationErrors.length === 0) {
      mon.editor.setModelMarkers(model, 'json-corrector', [])
    } else {
      mon.editor.setModelMarkers(model, 'json-corrector', validationErrors.map(e => ({
        severity: mon.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: e.line,
        startColumn: e.column,
        endLineNumber: e.line,
        endColumn: e.column + 1,
      })))
    }
  }, [validationErrors, editorReady])

  const monacoTheme = editorTheme

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
