import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IntelligenceEntry, IntelligenceBundle, TARGET_DOMAINS } from './types.js';
import { extractDesignTokens } from './extractors/design-tokens.js';
import { extractComponents } from './extractors/components.js';
import { extractStorybook } from './extractors/storybook.js';
import { extractAccessibility } from './extractors/accessibility.js';
import { extractTypography } from './extractors/typography.js';
import { extractSpacing } from './extractors/spacing.js';
import { extractColorSystem } from './extractors/color-system.js';
import { extractUxPatterns } from './extractors/ux-patterns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SALVADOR_DATA = process.env.SALVADOR_DATA
  || join(process.env.HOME!, 'projects/salvador/intelligence/data');
const OUTPUT_DIR = join(__dirname, '..', 'bundles');

const extractors: Record<string, (dir: string) => IntelligenceEntry[]> = {
  'design-tokens': extractDesignTokens,
  'components': extractComponents,
  'storybook': extractStorybook,
  'accessibility': extractAccessibility,
  'typography': extractTypography,
  'spacing': extractSpacing,
  'color-system': extractColorSystem,
  'ux-patterns': extractUxPatterns,
};

mkdirSync(OUTPUT_DIR, { recursive: true });

let totalEntries = 0;
for (const domain of TARGET_DOMAINS) {
  const entries = extractors[domain](SALVADOR_DATA);
  const bundle: IntelligenceBundle = { domain, version: '1.0.0', entries };
  const outPath = join(OUTPUT_DIR, `${domain}.json`);
  writeFileSync(outPath, JSON.stringify(bundle, null, 2));
  console.log(`${domain}: ${entries.length} entries → ${outPath}`);
  totalEntries += entries.length;
}
console.log(`\nTotal: ${totalEntries} entries across ${TARGET_DOMAINS.length} domains`);
