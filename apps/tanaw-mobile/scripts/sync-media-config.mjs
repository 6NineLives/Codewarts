import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const yamlPath = join(root, 'config', 'media.yml');
const outPath = join(root, 'config', 'media.generated.ts');

const config = parse(readFileSync(yamlPath, 'utf8'));

const banner = `/**
 * AUTO-GENERATED from config/media.yml — do not edit by hand.
 * Run: npm run config:sync
 */
`;

const body = `${banner}import type { MediaConfig } from './media.types';

export const mediaConfig = ${JSON.stringify(config, null, 2)} as const satisfies MediaConfig;
`;

writeFileSync(outPath, body, 'utf8');
console.log(`Wrote ${outPath}`);
