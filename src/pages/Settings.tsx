import { useSettingsStore } from '@/store/editorStore'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/common/Button'
import type { EditorSettings } from '@/types/editor'

const settingGroups: {
  title: string
  key: keyof EditorSettings
  type: 'select' | 'number' | 'toggle'
  options?: { label: string; value: string | number | boolean }[]
}[] = [
  {
    title: 'Editor Theme',
    key: 'theme',
    type: 'select',
    options: [
      { label: 'Dark', value: 'vs-dark' },
      { label: 'Light', value: 'vs' },
      { label: 'High Contrast', value: 'hc-black' },
    ],
  },
  {
    title: 'Font Size',
    key: 'fontSize',
    type: 'number',
  },
  {
    title: 'Word Wrap',
    key: 'wordWrap',
    type: 'select',
    options: [
      { label: 'On', value: 'on' },
      { label: 'Off', value: 'off' },
    ],
  },
  {
    title: 'Tab Size',
    key: 'tabSize',
    type: 'select',
    options: [
      { label: '2 Spaces', value: 2 },
      { label: '4 Spaces', value: 4 },
      { label: '8 Spaces', value: 8 },
    ],
  },
  {
    title: 'Minimap',
    key: 'minimap',
    type: 'toggle',
  },
  {
    title: 'Animations',
    key: 'animations',
    type: 'toggle',
  },
]

const appThemeOptions = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
] as const

export default function SettingsPage() {
  const settings = useSettingsStore()
  const { updateSetting, resetSettings } = settings
  const { theme: appTheme, resolvedTheme, setTheme } = useTheme()

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-semibold text-text-primary">Settings</h1>
          <Button variant="ghost" size="xs" onClick={resetSettings}>
            Reset Defaults
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Application Theme</h2>
          <div className="flex gap-2">
            {appThemeOptions.map((opt) => {
              const isActive = appTheme === opt.value
              const isResolved = opt.value === 'system' ? resolvedTheme : opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as 'dark' | 'light' | 'system')}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-150 ${
                    isActive
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-surface hover:border-text-muted'
                  }`}
                >
                  <span className={`w-full h-12 rounded-lg flex items-center justify-center ${
                    isResolved === 'dark'
                      ? 'bg-[#0F172A] text-[#F8FAFC]'
                      : 'bg-[#F8FAFC] text-[#0F172A]'
                  }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {opt.value === 'dark' ? (
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      ) : opt.value === 'light' ? (
                        <>
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </>
                      ) : (
                        <>
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                        </>
                      )}
                    </svg>
                  </span>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-accent' : 'text-text-secondary'
                  }`}>{opt.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-muted mt-2">
            Current: <span className="font-medium capitalize">{resolvedTheme}</span>
            {appTheme === 'system' && ' (follows OS) '}
          </p>
        </div>

        <h2 className="text-sm font-semibold text-text-primary mb-3">Editor Settings</h2>
        <div className="space-y-1">
          {settingGroups.map((group) => (
            <div key={group.key} className="flex items-center justify-between h-10 px-3 rounded-lg hover:bg-hover transition-colors">
              <span className="text-sm text-text-primary">{group.title}</span>
              <div>
                {group.type === 'select' && group.options && (
                  <select
                    value={String(settings[group.key])}
                    onChange={(e) => {
                      const opt = group.options?.find((o) => String(o.value) === e.target.value)
                      if (opt) updateSetting(group.key, opt.value as never)
                    }}
                    className="bg-editor-bg border border-border rounded text-xs text-text-primary px-2.5 py-1.5 outline-none focus:border-accent min-w-[120px]"
                  >
                    {group.options.map((opt) => (
                      <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                {group.type === 'number' && (
                  <input
                    type="number"
                    value={settings[group.key] as number}
                    onChange={(e) => updateSetting(group.key, Number(e.target.value) as never)}
                    min={10}
                    max={30}
                    className="w-16 bg-editor-bg border border-border rounded text-xs text-text-primary px-2.5 py-1.5 outline-none focus:border-accent text-center"
                  />
                )}
                {group.type === 'toggle' && (
                  <button
                    onClick={() => updateSetting(group.key, !settings[group.key] as never)}
                    role="switch"
                    aria-checked={!!settings[group.key]}
                    className={`relative w-8 h-4 rounded-full transition-colors ${settings[group.key] ? 'bg-accent' : 'bg-border'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-card transition-transform ${settings[group.key] ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
