import { useState, useRef, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { BottomPanel } from './BottomPanel'
import { StatusBar } from './StatusBar'
import { useEditorStore } from '@/store/editorStore'
import { useRun } from '@/hooks/useRun'

export function Layout() {
  const { isSidebarOpen, isRightPanelOpen, toggleSidebar, toggleRightPanel } = useEditorStore()
  const { run } = useRun()
  const [rightWidth, setRightWidth] = useState(300)
  const [consoleHeight, setConsoleHeight] = useState(160)
  const isDraggingRight = useRef(false)
  const isDraggingConsole = useRef(false)
  const runRef = useRef(run)
  runRef.current = run
  const isSidebarOpenRef = useRef(isSidebarOpen)
  isSidebarOpenRef.current = isSidebarOpen

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRight.current = true
    document.body.style.cursor = 'col-resize'
  }, [])

  const handleConsoleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingConsole.current = true
    document.body.style.cursor = 'row-resize'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRight.current) {
        const sidebarWidth = isSidebarOpenRef.current ? 230 : 0
        setRightWidth(Math.max(240, Math.min(400, window.innerWidth - e.clientX - sidebarWidth)))
      }
      if (isDraggingConsole.current) {
        setConsoleHeight(Math.max(80, Math.min(400, window.innerHeight - e.clientY - 80)))
      }
    }
    const handleMouseUp = () => {
      if (isDraggingRight.current || isDraggingConsole.current) {
        isDraggingRight.current = false
        isDraggingConsole.current = false
        document.body.style.cursor = ''
      }
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
      window.dispatchEvent(new CustomEvent('editor:save'))
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
    const handleRunEvent = () => runRef.current()
    window.addEventListener('editor:run', handleRunEvent)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('editor:run', handleRunEvent)
    }
  }, [handleKeyDown])

  return (
    <div className="h-screen w-screen flex flex-col bg-bg text-text overflow-hidden">
      {/* Top Bar - 58px */}
      <TopBar />

      {/* Main Area - flex row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - 230px */}
        {isSidebarOpen && <Sidebar />}

        {/* Center + Right Panel */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* Center: Editor + Bottom Panel */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Editor area */}
            <div className="flex-1 overflow-hidden min-w-0">
              <Outlet />
            </div>

            {/* Console resize handle */}
            <div
              className="h-px cursor-row-resize shrink-0 bg-border hover:bg-primary/30 transition-colors"
              onMouseDown={handleConsoleMouseDown}
            />

            {/* Bottom Panel */}
            <div style={{ height: consoleHeight }} className="shrink-0 overflow-hidden">
              <BottomPanel />
            </div>
          </div>

          {/* Right Panel resize handle */}
          {isRightPanelOpen && (
            <>
              <div
                className="w-px cursor-col-resize shrink-0 bg-border hover:bg-primary/30 transition-colors"
                onMouseDown={handleRightMouseDown}
              />
              <div style={{ width: rightWidth }} className="shrink-0 overflow-hidden">
                <RightPanel />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar - 24px */}
      <StatusBar />
    </div>
  )
}
