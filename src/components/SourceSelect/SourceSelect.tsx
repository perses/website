import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router';
import type { SourceSummary } from '../../content/types';

export interface SourceSelectProps {
  sources: SourceSummary[];
  current: string;
}

/**
 * SourceSelect switches between the documentation sources (Perses, the operator, the Helm charts, the plugins).
 */
export function SourceSelect({ sources, current }: SourceSelectProps) {
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
