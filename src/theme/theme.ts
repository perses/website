import { createTheme } from '@mui/material/styles';
import { blue, grey, white } from './colors';

const fontFamily =
  '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const monospaceFontFamily =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: blue[500], dark: blue[600], light: blue[300] },
        secondary: { main: grey[700] },
        background: { default: white, paper: white },
        text: { primary: grey[900], secondary: grey[700] },
        divider: grey[100],
      },
    },
    dark: {
      palette: {
        primary: { main: blue[400], dark: blue[500], light: blue[200] },
        secondary: { main: grey[200] },
        background: { default: grey[900], paper: grey[850] },
        text: { primary: grey[50], secondary: grey[300] },
        divider: grey[800],
      },
    },
  },
  typography: {
    fontFamily,
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.875rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
});
