import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateId } from '@/utils/helpers'

export function useEditor() {
  const {
    content, setContent, originalContent, setOriginalContent,
    pushHistory,
  } = useEditorStore()

  const lastSaved = useRef('')

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
    }
  }, [setContent])

  const loadContent = useCallback((value: string) => {
    setContent(value)
    setOriginalContent(value)
    pushHistory({
      id: generateId(),
      content: value,
      timestamp: Date.now(),
      label: 'Loaded content',
    })
    lastSaved.current = value
  }, [setContent, setOriginalContent, pushHistory])

  return {
    content,
    originalContent,
    handleChange,
    loadContent,
  }
}
