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
