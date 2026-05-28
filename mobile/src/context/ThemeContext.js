import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  light: {
    mode: 'light',
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    inputBg: '#F1F5F9',
    inputBorder: '#E2E8F0',
    headerBg: '#0F172A',
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#EEF2FF',
    accent: '#10B981', // Emerald 500
    success: '#10B981',
    warning: '#F59E0B', // Amber 500
    danger: '#EF4444', // Rose 500
    glass: 'rgba(255, 255, 255, 0.7)',
    statusBar: 'light-content',
    shadow: '#000000',
  },
  dark: {
    mode: 'dark',
    background: '#020617', // Slate 950
    card: '#0F172A', // Slate 900
    cardElevated: '#1E293B', // Slate 800
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#1E293B',
    inputBg: '#0F172A',
    inputBorder: '#334155',
    headerBg: '#020617',
    primary: '#6366F1', // Indigo 500
    primaryLight: 'rgba(99, 102, 241, 0.1)',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
    glass: 'rgba(15, 23, 42, 0.7)',
    statusBar: 'light-content',
    shadow: '#000000',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? THEMES.dark : THEMES.light;

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return light theme as default if not wrapped in provider
    return { theme: THEMES.light, isDark: false, toggleTheme: () => {} };
  }
  return context;
}
