import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router';
import type { VersionOption } from '../../content/types';

export interface VersionSelectProps {
  versions: VersionOption[];
  current: string;
}

/**
 * VersionSelect switches between the versions of a documentation source. It stays on the same page when it exists in
 * the selected version.
 */
export function VersionSelect({ versions, current }: VersionSelectProps) {
  const navigate = useNavigate();
  return (
    <TextField
      select
      size="small"
      fullWidth
      label="Version"
      value={current}
      onChange={(event) => {
        const target = versions.find((version) => version.id === event.target.value);
        if (target !== undefined) {
          void navigate(target.href);
        }
      }}
    >
      {versions.map((version) => (
        <MenuItem key={version.id} value={version.id}>
          {version.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
