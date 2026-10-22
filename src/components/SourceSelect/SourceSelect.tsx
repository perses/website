import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router';
import type { SourceSummary } from '../../content/types';

export interface SourceSelectProps {
  sources: SourceSummary[];
  current: string;
  /** Called after navigating to the selected documentation. */
  onNavigate?: () => void;
}

/**
 * SourceSelect switches between the documentation sources (Perses, the operator, the Helm charts, the plugins).
 */
export function SourceSelect({ sources, current, onNavigate }: SourceSelectProps) {
  const navigate = useNavigate();
  return (
    <TextField
      select
      size="small"
      fullWidth
      label="Documentation"
      value={current}
      onChange={(event) => {
        const target = sources.find((source) => source.id === event.target.value);
        if (target !== undefined) {
          void navigate(target.href);
          onNavigate?.();
        }
      }}
    >
      {sources.map((source) => (
        <MenuItem key={source.id} value={source.id}>
          {source.title}
        </MenuItem>
      ))}
    </TextField>
  );
}
