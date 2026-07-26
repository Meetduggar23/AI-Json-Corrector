import { useCallback, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { useSettingsStore } from '@/store/editorStore'
import { useTheme } from '@/hooks/useTheme'
import { useValidator } from '@/hooks/useValidator'

export function MonacoEditor() {
  const content = useEditorStore((s) => s.content)
  const setContent = useEditorStore((s) => s.setContent)
  const { fontSize, wordWrap, tabSize, minimap, lineNumbers } = useSettingsStore()
  const { resolvedTheme } = useTheme()
  const { debouncedValidate } = useValidator()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = useCallback((value: string | undefined) => {
    const v = value ?? ''
    setContent(v)
    debouncedValidate(v)
  }, [setContent, debouncedValidate])

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
