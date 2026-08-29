import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileJson, FileCheck, Wrench,
  Sparkles, Shrink, FileSearch, GitCompare, Clock, Settings,
} from 'lucide-react'
import { cn } from '@/utils/helpers'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileJson, label: 'Workspace', path: '/' },
  { icon: FileCheck, label: 'Validator', path: '/validator' },
  { icon: Wrench, label: 'Repair', path: '/repair' },
  { icon: Sparkles, label: 'Beautify', path: '/beautify' },
  { icon: Shrink, label: 'Minify', path: '/minify' },
  { icon: FileSearch, label: 'Schema', path: '/schema' },
  { icon: GitCompare, label: 'Diff Viewer', path: '/diff' },
  { icon: Clock, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

function isActive(itemPath: string, pathname: string): boolean {
  if (itemPath === '/') return pathname === '/'
  return pathname === itemPath
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="w-[230px] h-full bg-sidebar-bg-bg border-r border-border flex flex-col shrink-0 overflow-hidden select-none">
      <div className="flex-1 flex flex-col py-3 px-2 gap-[2px] overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path, location.pathname)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 rounded-md transition-colors shrink-0 h-10 px-3 text-left',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text hover:bg-surface-hover'
              )}
              title={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
              <span className="text-[14px]">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
          <span className="text-[12px] text-text-muted truncate">Offline — all processing local</span>
        </div>
      </div>
    </nav>
  )
}
