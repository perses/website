import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import { contentDir } from './config.server.ts';
import type { Adopter } from './types.ts';

const adoptersSchema = z.array(
  z.object({
    name: z.string(),
    url: z.url(),
    logo: z.object({ light: z.string(), dark: z.string().optional() }),
  }),
);

export function loadAdopters(): Adopter[] {
  return adoptersSchema.parse(parse(readFileSync(join(contentDir(), 'adopters.yaml'), 'utf8')));
}
