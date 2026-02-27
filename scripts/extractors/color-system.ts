import { join } from 'path';
import { IntelligenceEntry, slugify, readJson } from '../types.js';

export function extractColorSystem(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'color-system';

  // --- color-intelligence.json ---
  const colors = readJson(join(sourceDir, 'color-intelligence.json'));

  // contexts → pattern entries per context
  for (const [ctxName, ctxData] of Object.entries(colors.contexts ?? {})) {
    const d = ctxData as any;
    const details: string[] = [];
    if (d.description) details.push(d.description);
    if (d.solid) details.push(`Light: ${d.solid.light?.bg ?? d.light?.bg ?? 'N/A'}, Dark: ${d.solid.dark?.bg ?? d.dark?.bg ?? 'N/A'}`);
    if (d.light && !d.solid) details.push(`Light: ${d.light.bg}`);
    if (d.variants) {
      const variantNames = Object.keys(d.variants).join(', ');
      details.push(`Variants: ${variantNames}`);
    }

    entries.push({
      id: slugify(`${domain}-context-${ctxName}`),
      type: 'pattern',
      domain,
      title: `Color context: ${ctxName}`,
      severity: 'suggestion',
      description: details.join('. '),
      tags: ['color-system', 'context', ctxName],
    });
  }

  // harmony_principles → rule entries
  for (const [key, data] of Object.entries(colors.harmony_principles ?? {})) {
    if (key === '_note') continue;
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-harmony-${key}`),
      type: 'rule',
      domain,
      title: `Color harmony: ${d.rule}`,
      severity: 'critical',
      description: d.formula || d.rule,
      why: d.why,
      example: d.example?.good ? `Good: ${d.example.good}` : d.use,
      counterExample: d.example?.bad ? `Bad: ${d.example.bad}` : undefined,
      tags: ['color-system', 'harmony', 'contrast'],
    });
  }

  // forbidden → anti-pattern entries
  for (const f of colors.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-forbidden-${f.pattern}`),
      type: 'anti-pattern',
      domain,
      title: `Color forbidden: ${f.pattern}`,
      severity: 'critical',
      description: f.reason,
      example: (f.examples ?? []).join(', '),
      tags: ['color-system', 'forbidden'],
    });
  }

  // --- design-advanced.json ---
  const advanced = readJson(join(sourceDir, 'design-advanced.json'));

  // depthLayering.layers → pattern entries
  for (const layer of advanced.depthLayering?.layers ?? []) {
    entries.push({
      id: slugify(`${domain}-depth-layer-${layer.name}`),
      type: 'pattern',
      domain,
      title: `Depth layer: ${layer.name} (depth ${layer.depth})`,
      severity: 'suggestion',
      description: `Use: ${layer.use}. Token: ${layer.token}`,
      example: `Shadow: ${layer.shadow ?? 'none'}. Light: ${layer.light?.name ?? layer.light?.color ?? 'N/A'}`,
      tags: ['color-system', 'depth', 'layering'],
    });
  }

  // depthLayering.antiPatterns → anti-pattern entries
  for (const ap of advanced.depthLayering?.antiPatterns ?? []) {
    entries.push({
      id: slugify(`${domain}-depth-antipattern-${ap.pattern}`),
      type: 'anti-pattern',
      domain,
      title: `Depth anti-pattern: ${ap.pattern}`,
      severity: 'warning',
      description: `${ap.why}. Fix: ${ap.fix}`,
      tags: ['color-system', 'depth', 'anti-pattern'],
    });
  }

  // --- design-enhancements.json ---
  const enhancements = readJson(join(sourceDir, 'design-enhancements.json'));
  const darkMode = enhancements.darkMode ?? {};

  // darkMode.formula → rule entry
  if (darkMode.formula) {
    const mapping = Object.entries(darkMode.mapping ?? {})
      .map(([light, dark]) => `${light} ↔ ${dark}`)
      .join(', ');
    entries.push({
      id: slugify(`${domain}-dark-mode-formula`),
      type: 'rule',
      domain,
      title: `Dark mode formula: ${darkMode.formula}`,
      severity: 'critical',
      description: `Shade mapping: ${mapping}`,
      tags: ['color-system', 'dark-mode', 'formula'],
    });
  }

  // darkMode.semanticTokens → pattern entry
  if (darkMode.semanticTokens) {
    const tokenSummary = Object.entries(darkMode.semanticTokens)
      .map(([category, tokens]) => {
        const tokenList = Object.entries(tokens as Record<string, any>)
          .map(([name, vals]) => `${name}: light=${vals.light}, dark=${vals.dark}`)
          .join('; ');
        return `${category}: ${tokenList}`;
      })
      .join(' | ');
    entries.push({
      id: slugify(`${domain}-dark-mode-semantic-tokens`),
      type: 'pattern',
      domain,
      title: 'Dark mode semantic tokens',
      severity: 'suggestion',
      description: tokenSummary,
      tags: ['color-system', 'dark-mode', 'semantic-tokens'],
    });
  }

  // darkMode.antiPattern → anti-pattern entry
  if (darkMode.antiPattern) {
    entries.push({
      id: slugify(`${domain}-dark-mode-antipattern`),
      type: 'anti-pattern',
      domain,
      title: `Dark mode anti-pattern: ${darkMode.antiPattern}`,
      severity: 'critical',
      description: darkMode.antiPattern,
      tags: ['color-system', 'dark-mode', 'anti-pattern'],
    });
  }

  return entries;
}
