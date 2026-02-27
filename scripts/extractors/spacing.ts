import { join } from 'path';
import { IntelligenceEntry, slugify, mapSeverity, readJson } from '../types.js';

export function extractSpacing(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'spacing';

  // --- design-foundations.json ---
  const foundations = readJson(join(sourceDir, 'design-foundations.json'));
  const sp = foundations.spacing ?? {};

  // layers → pattern entry (two-layer system)
  if (sp.layers) {
    entries.push({
      id: slugify(`${domain}-two-layer-system`),
      type: 'pattern',
      domain,
      title: 'Two-layer spacing system: precision (4pt) + rhythm (8pt)',
      severity: 'critical',
      description: sp.layers.description,
      example: `Precision: ${sp.layers.precision?.role}. Rhythm: ${sp.layers.rhythm?.role}`,
      tags: ['spacing', 'layers', 'system', '4pt', '8pt'],
    });
  }

  // tokens → pattern entries
  for (const t of sp.tokens ?? []) {
    entries.push({
      id: slugify(`${domain}-token-${t.name}`),
      type: 'pattern',
      domain,
      title: `Spacing token: ${t.name} (${t.px}px)`,
      severity: 'suggestion',
      description: `Use: ${t.use}. Layer: ${t.layer}`,
      example: `Tailwind: ${t.tailwind}`,
      tags: ['spacing', 'tokens', t.layer],
    });
  }

  // forbidden → anti-pattern entries
  for (const f of sp.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-forbidden-${f}`),
      type: 'anti-pattern',
      domain,
      title: `Spacing forbidden: ${f}`,
      severity: 'critical',
      description: f,
      tags: ['spacing', 'forbidden'],
    });
  }

  // layoutAntiPatterns → anti-pattern entries
  for (const [name, data] of Object.entries(sp.layoutAntiPatterns ?? {})) {
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-layout-antipattern-${name}`),
      type: 'anti-pattern',
      domain,
      title: `Layout anti-pattern: ${name}`,
      severity: mapSeverity(d.severity ?? 'warning'),
      description: d.description,
      why: d.rule,
      counterExample: d.fix,
      tags: ['spacing', 'layout', 'anti-pattern'],
    });
  }

  // principles.rules → rule entries
  if (sp.principles?.rules) {
    for (const rule of sp.principles.rules) {
      entries.push({
        id: slugify(`${domain}-principle-${rule}`),
        type: 'rule',
        domain,
        title: `Spacing principle: ${rule}`,
        severity: 'warning',
        description: rule,
        context: sp.principles.corePhilosophy,
        tags: ['spacing', 'principles', 'white-space'],
      });
    }
  }

  // --- design-advanced.json ---
  const advanced = readJson(join(sourceDir, 'design-advanced.json'));

  // borderRadius tokens → pattern entries
  for (const t of advanced.borderRadius?.tokens ?? []) {
    entries.push({
      id: slugify(`${domain}-border-radius-${t.name}`),
      type: 'pattern',
      domain,
      title: `Border radius: ${t.name} (${t.px}px)`,
      severity: 'suggestion',
      description: `Use: ${t.use}`,
      example: `Tailwind: ${t.tailwind}`,
      tags: ['spacing', 'border-radius', 'tokens'],
    });
  }

  // borderRadius nestedFormula → rule entry
  if (advanced.borderRadius?.nestedFormula) {
    const nf = advanced.borderRadius.nestedFormula;
    const examples = (nf.examples ?? [])
      .map((e: any) => `inner ${e.inner} + padding ${e.padding} = outer ${e.outer}`)
      .join('; ');
    entries.push({
      id: slugify(`${domain}-nested-radius-formula`),
      type: 'rule',
      domain,
      title: `Nested border radius: ${nf.rule}`,
      severity: 'warning',
      description: `${nf.rule}. ${examples}`,
      tags: ['spacing', 'border-radius', 'nested', 'formula'],
    });
  }

  return entries;
}
