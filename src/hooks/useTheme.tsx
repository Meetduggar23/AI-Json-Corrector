import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('json-corrector-theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch {}
    return 'dark'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  const applyTheme = useCallback((t: Theme) => {
    setResolvedTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('json-corrector-theme', t) } catch {}
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('theme-transition')
    const timeout = setTimeout(() => html.classList.remove('theme-transition'), 200)
    return () => clearTimeout(timeout)
  }, [resolvedTheme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
