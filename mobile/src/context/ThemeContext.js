import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  light: {
    mode: 'light',
    background: '#f8fafc',
    card: '#fff',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#f1f5f9',
    inputBg: '#f8fafc',
    inputBorder: '#e2e8f0',
    headerBg: '#0f172a',
    primary: '#2563eb',
    accent: '#059669',
    statusBar: 'light-content',
  },
  dark: {
    mode: 'dark',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    headerBg: '#020617',
    primary: '#3b82f6',
    accent: '#10b981',
    statusBar: 'light-content',
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
