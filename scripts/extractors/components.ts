import { join } from 'path';
import { IntelligenceEntry, slugify, mapSeverity, readJson } from '../types.js';

export function extractComponents(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'components';

  // --- variant-philosophy.json ---
  const variants = readJson(join(sourceDir, 'variant-philosophy.json'));

  // autoRejectCriteria → anti-pattern entries
  for (const c of variants.whenToReject?.autoRejectCriteria ?? []) {
    entries.push({
      id: slugify(`${domain}-variant-reject-${c.signal}`),
      type: 'anti-pattern',
      domain,
      title: `Variant rejection: ${c.signal}`,
      severity: 'warning',
      description: c.reason,
      example: `Bad: ${c.example}`,
      tags: ['components', 'variants', 'anti-pattern'],
    });
  }

  // semanticVsCosmetic → pattern entries
  if (variants.semanticVsCosmetic?.statusVariants) {
    const statusList = variants.semanticVsCosmetic.statusVariants.variants
      .map((v: any) => `${v.name}: ${v.meaning}`)
      .join('; ');
    entries.push({
      id: slugify(`${domain}-semantic-status-variants`),
      type: 'pattern',
      domain,
      title: 'Semantic status variants',
      severity: 'critical',
      description: `${variants.semanticVsCosmetic.statusVariants.description}. ${statusList}`,
      tags: ['components', 'variants', 'semantic'],
    });
  }

  if (variants.semanticVsCosmetic?.actionVariants) {
    const actionList = variants.semanticVsCosmetic.actionVariants.variants
      .map((v: any) => `${v.name}: ${v.use}`)
      .join('; ');
    entries.push({
      id: slugify(`${domain}-semantic-action-variants`),
      type: 'pattern',
      domain,
      title: 'Semantic action variants',
      severity: 'critical',
      description: `${variants.semanticVsCosmetic.actionVariants.description}. ${actionList}`,
      tags: ['components', 'variants', 'semantic', 'actions'],
    });
  }

  // antiPatterns.signals → anti-pattern entries
  for (const ap of variants.antiPatterns?.signals ?? []) {
    entries.push({
      id: slugify(`${domain}-variant-antipattern-${ap.signal}`),
      type: 'anti-pattern',
      domain,
      title: `Variant anti-pattern: ${ap.signal}`,
      severity: 'warning',
      description: ap.fix,
      example: `Bad: ${ap.example}`,
      tags: ['components', 'variants', 'anti-pattern'],
    });
  }

  // --- component-dev-intelligence.json ---
  const devIntel = readJson(join(sourceDir, 'component-dev-intelligence.json'));

  // preBuild.gate.questions → rule entries
  for (const q of devIntel.preBuild?.gate?.questions ?? []) {
    entries.push({
      id: slugify(`${domain}-prebuild-${q.question}`),
      type: 'rule',
      domain,
      title: `Pre-build gate: ${q.question}`,
      severity: 'critical',
      description: `If yes: ${q.ifYes}. If no: ${q.ifNo}`,
      tags: ['components', 'pre-build', 'gate'],
    });
  }

  // redFlags.signals → anti-pattern entries
  for (const rf of devIntel.redFlags?.signals ?? []) {
    entries.push({
      id: slugify(`${domain}-redflag-${rf.signal}`),
      type: 'anti-pattern',
      domain,
      title: `Red flag: ${rf.signal}`,
      severity: 'warning',
      description: rf.action,
      tags: ['components', 'red-flags'],
    });
  }

  // apiDesign.the333Rule → pattern entry
  if (devIntel.apiDesign?.the333Rule) {
    entries.push({
      id: slugify(`${domain}-api-333-rule`),
      type: 'pattern',
      domain,
      title: 'The 3-3-3 Rule for component APIs',
      severity: 'critical',
      description: devIntel.apiDesign.the333Rule.rules.join('. '),
      tags: ['components', 'api-design', 'rule'],
    });
  }

  // --- component-usage-patterns.json ---
  const usagePatterns = readJson(join(sourceDir, 'component-usage-patterns.json'));

  // composition.forbidden → anti-pattern entries
  for (const f of usagePatterns.composition?.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-composition-forbidden-${f.pattern}`),
      type: 'anti-pattern',
      domain,
      title: `Forbidden composition: ${f.pattern}`,
      severity: 'critical',
      description: f.why,
      counterExample: f.fix,
      tags: ['components', 'composition', 'forbidden'],
    });
  }

  // --- api-constraints.json ---
  const apiConstraints = readJson(join(sourceDir, 'api-constraints.json'));

  // propLimits.constraints → rule entries
  for (const c of apiConstraints.propLimits?.constraints ?? []) {
    entries.push({
      id: slugify(`${domain}-api-constraint-${c.name}`),
      type: 'rule',
      domain,
      title: `API constraint: ${c.name} (limit: ${c.limit})`,
      severity: 'critical',
      description: `${c.rationale}. Action: ${c.action}`,
      tags: ['components', 'api-constraints', 'props'],
    });
  }

  // antiPatterns → anti-pattern entries
  for (const ap of apiConstraints.antiPatterns ?? []) {
    entries.push({
      id: slugify(`${domain}-api-antipattern-${ap.pattern}`),
      type: 'anti-pattern',
      domain,
      title: `API anti-pattern: ${ap.pattern}`,
      severity: 'warning',
      description: `Issue: ${ap.issue}. Fix: ${ap.fix}`,
      tags: ['components', 'api-constraints', 'anti-pattern'],
    });
  }

  // --- architecture-patterns.json ---
  const architecture = readJson(join(sourceDir, 'architecture-patterns.json'));

  // atomicLevels → pattern entries
  for (const [level, data] of Object.entries(architecture.atomicLevels ?? {})) {
    const d = data as any;
    entries.push({
      id: slugify(`${domain}-atomic-${level}`),
      type: 'pattern',
      domain,
      title: `Atomic level: ${level} — ${d.definition}`,
      severity: 'suggestion',
      description: d.description,
      example: `Examples: ${(d.examples ?? []).join(', ')}`,
      context: `State: ${d.stateManagement?.approach ?? 'N/A'}`,
      tags: ['components', 'architecture', 'atomic-design', level.toLowerCase()],
    });
  }

  // antiPatterns → anti-pattern entries
  for (const ap of architecture.antiPatterns ?? []) {
    entries.push({
      id: slugify(`${domain}-arch-antipattern-${ap.pattern}`),
      type: 'anti-pattern',
      domain,
      title: `Architecture anti-pattern: ${ap.pattern}`,
      severity: 'warning',
      description: `Problem: ${ap.problem}. Fix: ${ap.fix}`,
      tags: ['components', 'architecture', 'anti-pattern'],
    });
  }

  // --- shadcn-intelligence.json ---
  const shadcn = readJson(join(sourceDir, 'shadcn-intelligence.json'));

  for (const comp of shadcn.components ?? []) {
    entries.push({
      id: slugify(`${domain}-shadcn-${comp.slug}`),
      type: 'pattern',
      domain,
      title: `shadcn/ui: ${comp.name}`,
      severity: 'suggestion',
      description: comp.description,
      example: comp.installCmd,
      context: comp.radixPrimitive ? `Radix primitive: ${comp.radixPrimitive}` : undefined,
      tags: ['components', 'shadcn', comp.category, ...(comp.features ?? [])],
      appliesTo: comp.subComponents?.length ? comp.subComponents : undefined,
    });
  }

  // --- stabilization-patterns.json ---
  const stabilization = readJson(join(sourceDir, 'stabilization-patterns.json'));

  // safeChanges.patterns → pattern entries
  for (const p of stabilization.safeChanges?.patterns ?? []) {
    entries.push({
      id: slugify(`${domain}-safe-change-${p.pattern}`),
      type: 'pattern',
      domain,
      title: `Safe change: ${p.pattern}`,
      severity: 'suggestion',
      description: p.implementationNotes,
      example: (p.examples ?? []).join('; '),
      tags: ['components', 'stabilization', 'safe-changes', p.riskLevel?.toLowerCase()],
    });
  }

  // breakingChanges.highRisk → rule entries
  for (const bc of stabilization.breakingChanges?.highRisk ?? []) {
    entries.push({
      id: slugify(`${domain}-breaking-change-${bc.changeType}`),
      type: 'rule',
      domain,
      title: `Breaking change risk: ${bc.changeType}`,
      severity: 'critical',
      description: `Mitigation: ${bc.mitigationStrategy}`,
      example: (bc.examples ?? []).join('; '),
      tags: ['components', 'stabilization', 'breaking-changes'],
    });
  }

  // --- clean-code-rules.json ---
  const cleanCode = readJson(join(sourceDir, 'clean-code-rules.json'));

  for (const ap of cleanCode['anti-patterns'] ?? []) {
    entries.push({
      id: slugify(`${domain}-clean-code-${ap.pattern}`),
      type: 'anti-pattern',
      domain,
      title: `Clean code: ${ap.pattern}`,
      severity: 'warning',
      description: `Problem: ${ap.problem}. Fix: ${ap.fix}`,
      tags: ['components', 'clean-code', 'anti-pattern'],
    });
  }

  // function size rules → rule entries
  if (cleanCode.functions?.sizeTargets) {
    for (const target of cleanCode.functions.sizeTargets) {
      if (target.status === 'Critical' || target.status === 'Warning') {
        entries.push({
          id: slugify(`${domain}-function-size-${target.status}`),
          type: 'rule',
          domain,
          title: `Function size ${target.status}: ${target.lines} lines`,
          severity: target.status === 'Critical' ? 'critical' : 'warning',
          description: target.action,
          tags: ['components', 'clean-code', 'function-size'],
        });
      }
    }
  }

  // file limits → rule entries
  if (cleanCode['file-limits']?.limits) {
    for (const limit of cleanCode['file-limits'].limits) {
      entries.push({
        id: slugify(`${domain}-file-limit-${limit.fileType}`),
        type: 'rule',
        domain,
        title: `File limit: ${limit.fileType} max ${limit.maxLines} lines`,
        severity: 'warning',
        description: limit.actionWhenExceeded,
        tags: ['components', 'clean-code', 'file-limits'],
      });
    }
  }

  return entries;
}
