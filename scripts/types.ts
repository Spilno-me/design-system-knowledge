export interface IntelligenceEntry {
  id: string;
  type: 'pattern' | 'anti-pattern' | 'rule';
  domain: string;
  title: string;
  severity: 'critical' | 'warning' | 'suggestion';
  description: string;
  context?: string;
  example?: string;
  counterExample?: string;
  why?: string;
  tags: string[];
  appliesTo?: string[];
}

export interface IntelligenceBundle {
  domain: string;
  version: string;
  entries: IntelligenceEntry[];
}

export const TARGET_DOMAINS = [
  'design-tokens',
  'components',
  'storybook',
  'accessibility',
  'typography',
  'spacing',
  'color-system',
  'ux-patterns',
] as const;

export type TargetDomain = typeof TARGET_DOMAINS[number];

export const SOURCE_MAPPING: Record<string, TargetDomain[]> = {
  'token-rules.json': ['design-tokens'],
  'design-foundations.json': ['design-tokens', 'typography', 'spacing', 'accessibility'],
  'guidance.json': ['design-tokens'],
  'color-intelligence.json': ['color-system'],
  'design-advanced.json': ['color-system', 'spacing', 'ux-patterns'],
  'design-enhancements.json': ['color-system', 'typography', 'ux-patterns'],
  'variant-philosophy.json': ['components'],
  'component-dev-intelligence.json': ['components'],
  'component-usage-patterns.json': ['components', 'accessibility'],
  'api-constraints.json': ['components'],
  'architecture-patterns.json': ['components'],
  'shadcn-intelligence.json': ['components'],
  'stabilization-patterns.json': ['components'],
  'workflow-patterns.json': ['storybook'],
  'ux-laws.json': ['ux-patterns', 'accessibility'],
  'defensive-design.json': ['ux-patterns'],
  'ui-patterns.json': ['ux-patterns'],
  'dialog-patterns.json': ['ux-patterns'],
  'ux-writing.json': ['ux-patterns'],
  'clean-code-rules.json': ['components'],
  'performance-constraints.json': ['ux-patterns'],
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function mapSeverity(sev: string): IntelligenceEntry['severity'] {
  if (sev === 'error' || sev === 'critical') return 'critical';
  if (sev === 'warning') return 'warning';
  return 'suggestion';
}

export function readJson(filePath: string): any {
  const { readFileSync } = require('fs');
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}
