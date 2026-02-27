import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IntelligenceBundle, IntelligenceEntry } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BUNDLES_DIR = join(__dirname, '..', 'bundles');

const VALID_TYPES: IntelligenceEntry['type'][] = ['pattern', 'anti-pattern', 'rule'];
const VALID_SEVERITIES: IntelligenceEntry['severity'][] = ['critical', 'warning', 'suggestion'];
const REQUIRED_FIELDS = ['id', 'type', 'domain', 'title', 'severity', 'description', 'tags'] as const;

let totalIssues = 0;
let totalEntries = 0;
let allIds = new Set<string>();
let duplicateIds: string[] = [];

const bundleFiles = readdirSync(BUNDLES_DIR).filter(f => f.endsWith('.json'));

for (const file of bundleFiles) {
  const filePath = join(BUNDLES_DIR, file);
  const raw = readFileSync(filePath, 'utf-8');
  const bundle: IntelligenceBundle = JSON.parse(raw);
  const issues: string[] = [];
  const localIds = new Set<string>();

  for (let i = 0; i < bundle.entries.length; i++) {
    const entry = bundle.entries[i];
    const prefix = `  [${i}] ${entry.id || '(no id)'}`;

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      const value = entry[field];
      if (value === undefined || value === null) {
        issues.push(`${prefix}: missing required field '${field}'`);
      } else if (typeof value === 'string' && value.trim() === '') {
        issues.push(`${prefix}: empty required field '${field}'`);
      }
    }

    // Check tags is an array
    if (!Array.isArray(entry.tags)) {
      issues.push(`${prefix}: 'tags' must be an array`);
    }

    // Validate type enum
    if (entry.type && !VALID_TYPES.includes(entry.type)) {
      issues.push(`${prefix}: invalid type '${entry.type}'`);
    }

    // Validate severity enum
    if (entry.severity && !VALID_SEVERITIES.includes(entry.severity)) {
      issues.push(`${prefix}: invalid severity '${entry.severity}'`);
    }

    // Check for duplicate IDs within bundle
    if (entry.id) {
      if (localIds.has(entry.id)) {
        issues.push(`${prefix}: duplicate ID within bundle`);
      }
      localIds.add(entry.id);

      // Check across all bundles
      if (allIds.has(entry.id)) {
        duplicateIds.push(entry.id);
      }
      allIds.add(entry.id);
    }
  }

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  console.log(`${status}  ${file}: ${bundle.entries.length} entries, ${issues.length} issues`);
  for (const issue of issues) {
    console.log(issue);
  }

  totalIssues += issues.length;
  totalEntries += bundle.entries.length;
}

console.log('\n--- Summary ---');
console.log(`Bundles: ${bundleFiles.length}`);
console.log(`Total entries: ${totalEntries}`);
console.log(`Total issues: ${totalIssues}`);
console.log(`Unique IDs: ${allIds.size}`);
if (duplicateIds.length > 0) {
  console.log(`Cross-bundle duplicate IDs: ${duplicateIds.join(', ')}`);
}
console.log(`\nResult: ${totalIssues === 0 ? 'ALL PASS' : 'ISSUES FOUND'}`);

process.exit(totalIssues === 0 ? 0 : 1);
