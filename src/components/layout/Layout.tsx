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

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => { e.preventDefault(); isDraggingRight.current = true; document.body.style.cursor = 'col-resize' }, [])
  const handleConsoleMouseDown = useCallback((e: React.MouseEvent) => { e.preventDefault(); isDraggingConsole.current = true; document.body.style.cursor = 'row-resize' }, [])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (isDraggingRight.current) { const sw = isSidebarOpenRef.current ? 220 : 0; setRightWidth(Math.max(250, Math.min(380, window.innerWidth - e.clientX - sw))) }
      if (isDraggingConsole.current) setConsoleHeight(Math.max(80, Math.min(350, window.innerHeight - e.clientY - 80)))
    }
    const up = () => { isDraggingRight.current = false; isDraggingConsole.current = false; document.body.style.cursor = '' }
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up)
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); window.dispatchEvent(new CustomEvent('editor:save')) }
    if (e.key === 'F2') { e.preventDefault(); window.dispatchEvent(new CustomEvent('editor:rename')) }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runRef.current() }
    if (e.ctrlKey && e.shiftKey && e.key === 'b') { e.preventDefault(); toggleSidebar() }
    if (e.ctrlKey && e.shiftKey && e.key === ']') { e.preventDefault(); toggleRightPanel() }
  }, [toggleSidebar, toggleRightPanel])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    const h = () => runRef.current(); window.addEventListener('editor:run', h)
    return () => { document.removeEventListener('keydown', handleKeyDown); window.removeEventListener('editor:run', h) }
  }, [handleKeyDown])

  return (
    <div className="h-screen w-screen flex flex-col bg-bg text-text overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <Sidebar />}
        <div className="flex-1 flex overflow-hidden min-w-0">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-hidden min-w-0"><Outlet /></div>
            <div className="h-[4px] cursor-row-resize shrink-0 hover:bg-primary/20 transition-colors group relative" onMouseDown={handleConsoleMouseDown}>
              <div className="absolute inset-x-0 top-[1px] h-[1px] bg-border group-hover:bg-primary/40 transition-colors" />
            </div>
            <div style={{ height: consoleHeight }} className="shrink-0 overflow-hidden"><BottomPanel /></div>
          </div>
          {isRightPanelOpen && (
            <>
              <div className="w-[4px] cursor-col-resize shrink-0 hover:bg-primary/20 transition-colors group relative" onMouseDown={handleRightMouseDown}>
                <div className="absolute inset-y-0 left-[1px] w-[1px] bg-border group-hover:bg-primary/40 transition-colors" />
              </div>
              <div style={{ width: rightWidth }} className="shrink-0 overflow-hidden"><RightPanel /></div>
            </>
          )}
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
