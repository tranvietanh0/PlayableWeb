export const editorTheme = {
  color: {
    appBackground: '#111318',
    surface: '#1b1f27',
    surfaceRaised: '#232833',
    surfaceHover: '#2b3240',
    surfaceActive: '#12385a',
    border: '#343b49',
    borderStrong: '#465064',
    text: '#e6eaf2',
    textMuted: '#a8b0c0',
    textSubtle: '#747d8f',
    accent: '#2f81f7',
    accentHover: '#4090ff',
    accentText: '#ffffff',
    danger: '#d9534f',
    codeBackground: '#151820',
    overlay: 'rgba(27, 31, 39, 0.94)',
  },
  spacing: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  radius: {
    sm: 3,
    md: 5,
    lg: 8,
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    monoFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
    panelTitleSize: 11,
    bodySize: 13,
    controlSize: 12,
  },
  border: {
    default: '1px solid #343b49',
    strong: '1px solid #465064',
  },
} as const;

export type EditorTheme = typeof editorTheme;
