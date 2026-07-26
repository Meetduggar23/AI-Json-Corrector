import { useState, useRef, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TopToolbar } from './TopToolbar'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { StatusBar } from './StatusBar'
import { useEditorStore } from '@/store/editorStore'
import { useRun } from '@/hooks/useRun'

export function Layout() {
  const { isSidebarOpen, isRightPanelOpen, toggleSidebar, toggleRightPanel } = useEditorStore()
  const { run } = useRun()
  const [rightWidth, setRightWidth] = useState(320)
  const isDraggingRight = useRef(false)
  const runRef = useRef(run)
  runRef.current = run

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRight.current = true
    document.body.style.cursor = 'col-resize'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRight.current) {
        setRightWidth(Math.max(280, Math.min(420, window.innerWidth - e.clientX - 240)))
      }
    }
    const handleMouseUp = () => {
      isDraggingRight.current = false
      document.body.style.cursor = ''
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
    }
    if (e.key === 'F2') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('editor:rename'))
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runRef.current()
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'b') {
      e.preventDefault()
      toggleSidebar()
    }
    if (e.ctrlKey && e.shiftKey && e.key === ']') {
      e.preventDefault()
      toggleRightPanel()
    }
  }, [toggleSidebar, toggleRightPanel])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      <TopToolbar />
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <Sidebar />}
        <div className="flex-1 flex overflow-hidden min-w-0">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Outlet />
          </div>
          {isRightPanelOpen && (
            <>
              <div
                className="w-px cursor-col-resize shrink-0 bg-border hover:bg-accent/30 transition-colors"
                onMouseDown={handleRightMouseDown}
              />
              <div style={{ width: rightWidth }} className="shrink-0 overflow-hidden">
                <RightPanel />
              </div>
            </>
          )}
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
