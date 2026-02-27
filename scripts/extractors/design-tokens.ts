import { join } from 'path';
import { IntelligenceEntry, slugify, mapSeverity, readJson } from '../types.js';

export function extractDesignTokens(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'design-tokens';

  // --- token-rules.json ---
  const tokenRules = readJson(join(sourceDir, 'token-rules.json'));

  // forbidden patterns → rule entries
  for (const f of tokenRules.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-forbidden-${f.pattern}`),
      type: 'rule',
      domain,
      title: `Forbidden: ${f.pattern}`,
      severity: mapSeverity(f.severity),
      description: f.reason,
      context: 'Token usage validation',
      tags: ['tokens', 'forbidden', 'validation'],
    });
  }

  // tokenSelectionPriority → pattern entries
  for (const p of tokenRules.tokenSelectionPriority?.priority ?? []) {
    entries.push({
      id: slugify(`${domain}-priority-rank-${p.rank}-${p.type}`),
      type: 'pattern',
      domain,
      title: `Token Priority ${p.rank}: ${p.type}`,
      severity: 'critical',
      description: `${p.when}. Examples: ${p.examples.join(', ')}`,
      context: tokenRules.tokenSelectionPriority.rule,
      why: (tokenRules.tokenSelectionPriority.whySemantic ?? []).join('; '),
      tags: ['tokens', 'priority', 'semantic', p.type.toLowerCase()],
    });
  }

  // stylingRules → rule entries
  if (tokenRules.stylingRules) {
    entries.push({
      id: slugify(`${domain}-styling-prefer-tailwind`),
      type: 'rule',
      domain,
      title: 'Prefer Tailwind classes over inline styles',
      severity: 'warning',
      description: tokenRules.stylingRules.prefer,
      context: `Avoid !important: ${tokenRules.stylingRules.avoidImportant}`,
      tags: ['tokens', 'styling', 'tailwind'],
    });
  }

  // recommendations → pattern entries
  if (tokenRules.recommendations) {
    const recs = Object.entries(tokenRules.recommendations)
      .map(([from, to]) => `${from} → ${to}`)
      .join(', ');
    entries.push({
      id: slugify(`${domain}-recommendations-map`),
      type: 'pattern',
      domain,
      title: 'Token replacement recommendations',
      severity: 'suggestion',
      description: `Common color-to-token mappings: ${recs}`,
      tags: ['tokens', 'migration', 'recommendations'],
    });
  }

  // --- design-foundations.json (token-related violations) ---
  const foundations = readJson(join(sourceDir, 'design-foundations.json'));

  // commonViolations that are token-related (color/hex/rgb/hsl/spacing patterns)
  const tokenPatterns = /color|hex|rgb|hsl|bg-|text-|#[0-9]/i;
  for (const v of foundations.validation?.commonViolations ?? []) {
    if (tokenPatterns.test(v.pattern) || tokenPatterns.test(v.issue)) {
      entries.push({
        id: slugify(`${domain}-violation-${v.pattern}`),
        type: 'rule',
        domain,
        title: v.issue,
        severity: mapSeverity(v.severity),
        description: v.fix,
        example: v.autoFix ? `Auto-fix: ${v.autoFix.find} → ${v.autoFix.replace}` : undefined,
        tags: ['tokens', 'validation', 'violation'],
      });
    }
  }

  // --- guidance.json (component token maps) ---
  const guidance = readJson(join(sourceDir, 'guidance.json'));

  for (const [component, variants] of Object.entries(guidance)) {
    const variantEntries = Object.entries(variants as Record<string, Record<string, string>>);
    const tokenList = variantEntries
      .map(([variant, tokens]) => {
        const tokenStr = Object.entries(tokens).map(([k, v]) => `${k}: ${v}`).join(', ');
        return `${variant}: ${tokenStr}`;
      })
      .join('; ');

    entries.push({
      id: slugify(`${domain}-guidance-${component}`),
      type: 'pattern',
      domain,
      title: `Token guidance: ${component}`,
      severity: 'suggestion',
      description: `Recommended tokens for ${component} component: ${tokenList}`,
      tags: ['tokens', 'guidance', component],
    });
  }

  return entries;
}
