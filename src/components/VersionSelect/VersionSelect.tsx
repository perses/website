// Copyright The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router';
import type { VersionOption } from '../../content/types';

export interface VersionSelectProps {
  versions: VersionOption[];
  current: string;
  /** Called after navigating to the selected version. */
  onNavigate?: () => void;
}

/**
 * VersionSelect switches between the versions of a documentation source. It stays on the same page when it exists in
 * the selected version.
 */
export function VersionSelect({ versions, current, onNavigate }: VersionSelectProps) {
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
          onNavigate?.();
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
