import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileJson, FileCheck, Wrench,
  FileSearch, GitCompare, Clock, Settings,   Sun, Moon,
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useTheme } from '@/hooks/useTheme'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileJson, label: 'Workspace', path: '/' },
  { icon: FileCheck, label: 'Validator', path: '/validator' },
  { icon: Wrench, label: 'Repair', path: '/repair' },
  { icon: FileSearch, label: 'Schema', path: '/schema' },
  { icon: GitCompare, label: 'Diff Viewer', path: '/diff' },
  { icon: Clock, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const themeLabel = resolvedTheme === 'dark' ? 'Dark' : 'Light'
  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <nav className="w-[240px] h-full bg-sidebar border-r border-border flex flex-col shrink-0 overflow-hidden select-none">
      <div className="flex-1 flex flex-col py-4 px-3 gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex items-center gap-3 rounded-lg transition-colors shrink-0 h-9 px-3',
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-hover'
              )}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-accent" />
              )}
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
              <span className="text-[14px]">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="mx-4 border-t border-border" />
      <div className="flex flex-col gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[13px] text-text-muted">All systems operational</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeIcon size={14} className="text-text-muted" />
          <span className="text-[13px] text-text-muted">{themeLabel} Theme</span>
        </div>
      </div>
    </nav>
  )
}
