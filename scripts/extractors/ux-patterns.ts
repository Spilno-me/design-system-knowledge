import { join } from 'path';
import { IntelligenceEntry, slugify, readJson } from '../types.js';

export function extractUxPatterns(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'ux-patterns';

  // --- ux-laws.json ---
  const uxLaws = readJson(join(sourceDir, 'ux-laws.json'));

  // coreLaws → pattern entries
  for (const law of uxLaws.coreLaws ?? []) {
    entries.push({
      id: slugify(`${domain}-law-${law.name}`),
      type: 'pattern',
      domain,
      title: `UX Law: ${law.name}`,
      severity: 'warning',
      description: `${law.rule}. Application: ${law.application}`,
      example: (law.tokens ?? []).join(', '),
      counterExample: (law.violations ?? []).join(', '),
      tags: ['ux-patterns', 'ux-laws', law.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')],
    });
  }

  // gestaltPrinciples → pattern entries
  for (const g of uxLaws.gestaltPrinciples ?? []) {
    entries.push({
      id: slugify(`${domain}-gestalt-${g.name}`),
      type: 'pattern',
      domain,
      title: `Gestalt: ${g.name}`,
      severity: 'suggestion',
      description: g.meaning,
      example: (g.tokens ?? []).join(', '),
      tags: ['ux-patterns', 'gestalt', g.name.toLowerCase()],
    });
  }

  // buttonColorSemantics → rule entry
  if (uxLaws.buttonColorSemantics) {
    const bcs = uxLaws.buttonColorSemantics;
    const rules = Object.entries(bcs.rules ?? {})
      .map(([variant, data]: [string, any]) => `${variant}: ${data.use} (not for: ${data.notFor})`)
      .join('; ');
    entries.push({
      id: slugify(`${domain}-button-color-semantics`),
      type: 'rule',
      domain,
      title: 'Button color semantics',
      severity: 'critical',
      description: `${bcs.critical}. ${rules}`,
      why: (bcs.rationale ?? []).join('; '),
      tags: ['ux-patterns', 'buttons', 'color', 'semantics'],
    });
  }

  // actionOverflow → rule entry
  if (uxLaws.actionOverflow) {
    entries.push({
      id: slugify(`${domain}-action-overflow`),
      type: 'rule',
      domain,
      title: 'Action overflow rule',
      severity: 'warning',
      description: uxLaws.actionOverflow.critical,
      counterExample: (uxLaws.actionOverflow.violations ?? []).join('; '),
      tags: ['ux-patterns', 'actions', 'overflow', 'hicks-law'],
    });
  }

  // --- defensive-design.json ---
  const defensive = readJson(join(sourceDir, 'defensive-design.json'));

  // validationLevel.architecture.layers → pattern entries
  for (const layer of defensive.validationLevel?.architecture?.layers ?? []) {
    entries.push({
      id: slugify(`${domain}-validation-layer-${layer.layer}`),
      type: 'pattern',
      domain,
      title: `Validation layer: ${layer.layer}`,
      severity: 'suggestion',
      description: `${layer.role}. Has validation: ${layer.hasValidation}. Action: ${layer.action}`,
      context: `Analogy: ${layer.analogy}`,
      tags: ['ux-patterns', 'defensive-design', 'validation'],
    });
  }

  // gracefulDegradationLevels → pattern entries
  for (const level of defensive.dataError?.gracefulDegradationLevels ?? []) {
    entries.push({
      id: slugify(`${domain}-degradation-${level.level}`),
      type: 'pattern',
      domain,
      title: `Graceful degradation: ${level.level}`,
      severity: 'suggestion',
      description: `${level.behavior}. When: ${level.when}`,
      tags: ['ux-patterns', 'defensive-design', 'error-handling', 'degradation'],
    });
  }

  // --- ui-patterns.json ---
  const uiPatterns = readJson(join(sourceDir, 'ui-patterns.json'));

  // statusBadges.statuses → pattern entries
  for (const [status, data] of Object.entries(uiPatterns.statusBadges?.statuses ?? {})) {
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-status-badge-${status}`),
      type: 'pattern',
      domain,
      title: `Status badge: ${d.name}`,
      severity: 'suggestion',
      description: `${d.meaning}. Color: ${d.semanticColor}. Icon: ${d.icon}`,
      tags: ['ux-patterns', 'status', 'badges', status],
    });
  }

  // priorityBadges.priorities → pattern entries
  for (const [priority, data] of Object.entries(uiPatterns.priorityBadges?.priorities ?? {})) {
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-priority-badge-${priority}`),
      type: 'pattern',
      domain,
      title: `Priority badge: ${d.name}`,
      severity: 'suggestion',
      description: `Color: ${d.semanticColor}. Icon: ${d.icon}${d.animation ? `. Animation: ${d.animation}` : ''}`,
      tags: ['ux-patterns', 'priority', 'badges', priority],
    });
  }

  // --- dialog-patterns.json ---
  const dialogPatterns = readJson(join(sourceDir, 'dialog-patterns.json'));

  // selectionByFieldCount → rule entries
  for (const s of dialogPatterns.selectionByFieldCount ?? []) {
    entries.push({
      id: slugify(`${domain}-container-selection-${s.range}-fields`),
      type: 'rule',
      domain,
      title: `Container selection: ${s.range} fields → ${s.recommendedPattern}`,
      severity: 'warning',
      description: `Complexity: ${s.complexity}. Examples: ${(s.examples ?? []).join(', ')}`,
      tags: ['ux-patterns', 'dialog', 'container-selection', s.recommendedPattern],
    });
  }

  // antiPatterns → anti-pattern entries
  for (const ap of dialogPatterns.antiPatterns ?? []) {
    entries.push({
      id: slugify(`${domain}-dialog-antipattern-${ap.badPractice}`),
      type: 'anti-pattern',
      domain,
      title: `Dialog anti-pattern: ${ap.badPractice}`,
      severity: 'warning',
      description: `Problem: ${ap.problem}. Solution: ${ap.solution}`,
      tags: ['ux-patterns', 'dialog', 'anti-pattern'],
    });
  }

  // --- ux-writing.json ---
  const uxWriting = readJson(join(sourceDir, 'ux-writing.json'));

  // patterns → pattern entries
  for (const [patternName, data] of Object.entries(uxWriting.patterns ?? {})) {
    const d = data as any;
    if (d.do && d.examples) {
      entries.push({
        id: slugify(`${domain}-ux-writing-${patternName}`),
        type: 'pattern',
        domain,
        title: `UX writing: ${d.title || patternName}`,
        severity: 'suggestion',
        description: (d.do ?? []).join('. '),
        example: (d.examples?.good ?? []).join('; '),
        counterExample: (d.examples?.bad ?? []).join('; '),
        tags: ['ux-patterns', 'ux-writing', patternName],
      });
    }
  }

  // goldenRules.values → rule entries
  for (const rule of uxWriting.goldenRules?.values ?? []) {
    entries.push({
      id: slugify(`${domain}-writing-rule-${rule.rule}`),
      type: 'rule',
      domain,
      title: `UX writing rule: ${rule.rule}`,
      severity: 'warning',
      description: rule.description,
      tags: ['ux-patterns', 'ux-writing', 'golden-rules'],
    });
  }

  // --- design-advanced.json ---
  const advanced = readJson(join(sourceDir, 'design-advanced.json'));

  // containerPatterns.patterns → pattern entries
  for (const [name, data] of Object.entries(advanced.containerPatterns?.patterns ?? {})) {
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-container-${name}`),
      type: 'pattern',
      domain,
      title: `Container pattern: ${name}`,
      severity: 'suggestion',
      description: `Use for: ${(d.useFor ?? []).join(', ')}. Fields: ${d.fields ?? 'Variable'}. Complexity: ${d.complexity}`,
      tags: ['ux-patterns', 'containers', name],
    });
  }

  // errorHandling.patterns → pattern entries
  for (const [name, data] of Object.entries(advanced.errorHandling?.patterns ?? {})) {
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-error-handling-${name}`),
      type: 'pattern',
      domain,
      title: `Error handling: ${name}`,
      severity: 'suggestion',
      description: `Use: ${d.use}. ${d.rule ?? ''}`,
      tags: ['ux-patterns', 'error-handling', name],
    });
  }

  // --- performance-constraints.json ---
  const perf = readJson(join(sourceDir, 'performance-constraints.json'));

  // responseTime.thresholds → rule entries
  for (const t of perf.responseTime?.thresholds ?? []) {
    entries.push({
      id: slugify(`${domain}-response-time-${t.duration}`),
      type: 'rule',
      domain,
      title: `Response time ${t.duration}: ${t.perception}`,
      severity: t.duration.includes('400') || t.duration.includes('> 1') ? 'warning' : 'suggestion',
      description: `Required feedback: ${t.requiredFeedback}`,
      tags: ['ux-patterns', 'performance', 'response-time'],
    });
  }

  return entries;
}
