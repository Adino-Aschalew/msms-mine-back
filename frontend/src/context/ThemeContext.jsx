import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const themes = {
  light: {
    // Background
    background: 'bg-gray-50',
    backgroundGradient: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
    // Cards/Surfaces
    surface: 'bg-white',
    surfaceAlt: 'bg-gray-100',
    card: 'bg-white',
    cardBg: 'bg-white/80',
    cardBorder: 'border-gray-200',
    cardShadow: 'shadow-lg shadow-gray-200/20',
    // Text
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    textInverse: 'text-white',
    // Borders
    border: 'border-gray-200',
    borderLight: 'border-gray-200/50',
    // Primary
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    // Accents
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  },
  dark: {
    // Background
    background: 'bg-gray-900',
    backgroundGradient: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800',
    // Cards/Surfaces
    surface: 'bg-gray-800',
    surfaceAlt: 'bg-slate-800',
    card: 'bg-slate-800/40',
    cardBg: 'bg-slate-800/60',
    cardBorder: 'border-slate-700/50',
    cardShadow: 'shadow-xl shadow-black/10',
    // Text
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-slate-400',
    textInverse: 'text-gray-900',
    // Borders
    border: 'border-gray-700',
    borderLight: 'border-slate-700/50',
    // Primary
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-400',
    // Accents
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }
}

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'dark'
  })

  useEffect(() => {
    // Apply theme class to the document root
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const value = {
    theme,
    toggleTheme,
    colors: themes[theme],
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
