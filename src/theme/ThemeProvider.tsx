import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ThemeContext, type Theme } from './themeContext'

const STORAGE_KEY = '369stage-theme'

function readInitial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  const initialTheme: Theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  // Mount 전에 남아있던 html.dark를 즉시 정리해 첫 페인트 불일치 방지
  document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  return initialTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      if (e.newValue === 'light' || e.newValue === 'dark') setThemeState(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggle = useCallback(() => {
    setThemeState((t) => {
      const nextTheme = t === 'dark' ? 'light' : 'dark'
      return nextTheme
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
