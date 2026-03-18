// The host app (`frontend/src/App.jsx`) already wraps routes with the shared
// ThemeProvider. Re-export it here so employee components use the same context
// instance and don't throw "useTheme must be used within a ThemeProvider".
export { ThemeProvider, useTheme } from '../../../shared/contexts/ThemeContext';
