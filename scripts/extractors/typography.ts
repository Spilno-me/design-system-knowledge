import { join } from 'path';
import { IntelligenceEntry, slugify, readJson } from '../types.js';

export function extractTypography(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'typography';

  // --- design-foundations.json ---
  const foundations = readJson(join(sourceDir, 'design-foundations.json'));
  const typo = foundations.typography ?? {};

  // scale → pattern entries
  for (const s of typo.scale ?? []) {
    entries.push({
      id: slugify(`${domain}-scale-${s.role}`),
      type: 'pattern',
      domain,
      title: `Type scale: ${s.role}`,
      severity: 'suggestion',
      description: `${s.use}. Size: ${s.size}, weight: ${s.weight}`,
      example: `Tailwind: ${s.tailwind}`,
      tags: ['typography', 'scale', s.role.toLowerCase().replace(/\s+/g, '-')],
    });
  }

  // goldenRules → rule entries
  for (const rule of typo.goldenRules ?? []) {
    entries.push({
      id: slugify(`${domain}-golden-rule-${rule}`),
      type: 'rule',
      domain,
      title: `Typography rule: ${rule}`,
      severity: 'warning',
      description: rule,
      tags: ['typography', 'golden-rules'],
    });
  }

  // forbidden → anti-pattern entries
  for (const f of typo.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-forbidden-${f}`),
      type: 'anti-pattern',
      domain,
      title: `Typography forbidden: ${f}`,
      severity: 'critical',
      description: f,
      tags: ['typography', 'forbidden'],
    });
  }

  // fontRequirements → rule entries
  const fontReqs = foundations.fontRequirements;
  if (fontReqs) {
    // formats
    const formats = Object.entries(fontReqs.formats ?? {})
      .map(([fmt, data]: [string, any]) => `${fmt}: priority ${data.priority}${data.required ? ' (required)' : ''}`)
      .join(', ');
    entries.push({
      id: slugify(`${domain}-font-formats`),
      type: 'rule',
      domain,
      title: 'Font format requirements',
      severity: 'warning',
      description: `Required formats: ${formats}. Preference: ${(fontReqs.formatPreference ?? []).join(' > ')}`,
      tags: ['typography', 'fonts', 'formats'],
    });

    // minimum weights
    entries.push({
      id: slugify(`${domain}-font-minimum-weights`),
      type: 'rule',
      domain,
      title: `Font minimum weights: ${(fontReqs.minimumWeights ?? []).join(', ')}`,
      severity: 'warning',
      description: `Minimum weights: ${(fontReqs.minimumWeights ?? []).join(', ')}. Recommended: ${(fontReqs.recommendedWeights ?? []).join(', ')}`,
      tags: ['typography', 'fonts', 'weights'],
    });
  }

  // --- design-enhancements.json ---
  const enhancements = readJson(join(sourceDir, 'design-enhancements.json'));
  const icons = enhancements.iconography ?? {};

  // iconography sizes → pattern entries
  for (const size of icons.sizes ?? []) {
    entries.push({
      id: slugify(`${domain}-icon-size-${size.name}`),
      type: 'pattern',
      domain,
      title: `Icon size: ${size.name} (${size.px}px)`,
      severity: 'suggestion',
      description: `Use: ${size.use}`,
      tags: ['typography', 'iconography', 'sizes'],
    });
  }

  // iconography forbidden → anti-pattern entry
  if (icons.forbidden) {
    entries.push({
      id: slugify(`${domain}-icon-forbidden-emojis`),
      type: 'anti-pattern',
      domain,
      title: `Icons forbidden: ${icons.forbidden}`,
      severity: 'critical',
      description: `${icons.rule}. Use ${icons.library} instead.`,
      tags: ['typography', 'iconography', 'forbidden', 'emojis'],
    });
  }

  return entries;
}
