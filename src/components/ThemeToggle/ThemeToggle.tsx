import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined';
import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

type Mode = 'light' | 'dark' | 'system';

const nextMode: Record<Mode, Mode> = { system: 'light', light: 'dark', dark: 'system' };

const labels: Record<Mode, string> = {
  system: 'Theme: system preference',
  light: 'Theme: light',
  dark: 'Theme: dark',
};

/**
 * ThemeToggle cycles between the system preference, the light and the dark themes.
 */
export function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  // The mode is unknown until the component is mounted, as it is stored in the browser.
  const current: Mode = mode ?? 'system';
  const icon =
    current === 'light' ? <LightModeOutlined /> : current === 'dark' ? <DarkModeOutlined /> : <SettingsBrightnessOutlined />;
  return (
    <Tooltip title={`${labels[current]} (click to change)`}>
      <IconButton color="inherit" aria-label={labels[current]} onClick={() => setMode(nextMode[current])}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}
