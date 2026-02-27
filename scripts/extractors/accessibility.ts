import { join } from 'path';
import { IntelligenceEntry, slugify, mapSeverity, readJson } from '../types.js';

export function extractAccessibility(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'accessibility';

  // --- design-foundations.json ---
  const foundations = readJson(join(sourceDir, 'design-foundations.json'));

  // accessibilityViolations → rule entries
  for (const v of foundations.validation?.accessibilityViolations ?? []) {
    entries.push({
      id: slugify(`${domain}-violation-${v.issue}`),
      type: 'rule',
      domain,
      title: v.issue,
      severity: mapSeverity(v.severity),
      description: v.fix,
      context: `Pattern: ${v.pattern}`,
      tags: ['accessibility', 'validation', 'violation'],
    });
  }

  // requiredPatterns → rule entries
  for (const p of foundations.validation?.requiredPatterns ?? []) {
    entries.push({
      id: slugify(`${domain}-required-${p.context}-${p.pattern}`),
      type: 'rule',
      domain,
      title: `Required: ${p.issue}`,
      severity: mapSeverity(p.severity),
      description: p.fix,
      context: `Context: ${p.context}`,
      appliesTo: p.appliesTo,
      tags: ['accessibility', 'required-patterns', p.context],
    });
  }

  // --- component-usage-patterns.json ---
  const usage = readJson(join(sourceDir, 'component-usage-patterns.json'));

  // accessibility.keyboardNavigation → pattern entries
  for (const rule of usage.accessibility?.keyboardNavigation ?? []) {
    entries.push({
      id: slugify(`${domain}-keyboard-${rule}`),
      type: 'pattern',
      domain,
      title: `Keyboard: ${rule}`,
      severity: 'critical',
      description: rule,
      tags: ['accessibility', 'keyboard', 'navigation'],
    });
  }

  // accessibility.screenReaders → pattern entries
  for (const rule of usage.accessibility?.screenReaders ?? []) {
    entries.push({
      id: slugify(`${domain}-screenreader-${rule}`),
      type: 'pattern',
      domain,
      title: `Screen reader: ${rule}`,
      severity: 'critical',
      description: rule,
      tags: ['accessibility', 'screen-reader', 'aria'],
    });
  }

  // accessibility.colorContrast → rule entries
  for (const rule of usage.accessibility?.colorContrast ?? []) {
    entries.push({
      id: slugify(`${domain}-contrast-${rule}`),
      type: 'rule',
      domain,
      title: `Color contrast: ${rule}`,
      severity: 'critical',
      description: rule,
      tags: ['accessibility', 'color', 'contrast', 'wcag'],
    });
  }

  // --- ux-laws.json ---
  const uxLaws = readJson(join(sourceDir, 'ux-laws.json'));

  // Fitts's Law (touch targets) → rule entry
  const fitts = (uxLaws.coreLaws ?? []).find((l: any) => l.name === "Fitts's Law");
  if (fitts) {
    entries.push({
      id: slugify(`${domain}-fitts-law-touch-targets`),
      type: 'rule',
      domain,
      title: "Fitts's Law: minimum touch target size",
      severity: 'critical',
      description: `${fitts.rule}. Application: ${fitts.application}`,
      example: (fitts.tokens ?? []).join(', '),
      counterExample: (fitts.violations ?? []).join(', '),
      tags: ['accessibility', 'touch-target', 'fitts-law', 'mobile'],
    });
  }

  // Cognitive Load → rule entry (accessibility perspective)
  const cogLoad = (uxLaws.coreLaws ?? []).find((l: any) => l.name === 'Cognitive Load');
  if (cogLoad) {
    entries.push({
      id: slugify(`${domain}-cognitive-load`),
      type: 'rule',
      domain,
      title: 'Cognitive Load: reduce unnecessary mental burden',
      severity: 'warning',
      description: `${cogLoad.rule}. Application: ${cogLoad.application}`,
      counterExample: (cogLoad.violations ?? []).join(', '),
      tags: ['accessibility', 'cognitive-load', 'usability'],
    });
  }

  return entries;
}
