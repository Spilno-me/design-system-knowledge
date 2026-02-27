import { join } from 'path';
import { IntelligenceEntry, slugify, readJson } from '../types.js';

export function extractStorybook(sourceDir: string): IntelligenceEntry[] {
  const entries: IntelligenceEntry[] = [];
  const domain = 'storybook';

  const workflow = readJson(join(sourceDir, 'workflow-patterns.json'));
  const sb = workflow.storybook ?? {};
  const testing = workflow.testing ?? {};
  const masterProtocol = workflow.masterStoryProtocol;

  // requiredStories → pattern entries
  for (const s of sb.requiredStories ?? []) {
    entries.push({
      id: slugify(`${domain}-required-story-${s.name}`),
      type: 'pattern',
      domain,
      title: `Required story: ${s.name}`,
      severity: 'critical',
      description: `${s.purpose}. Shows: ${s.shows}`,
      tags: ['storybook', 'required', 'stories'],
    });
  }

  // optionalStories → pattern entries (severity: suggestion)
  for (const s of sb.optionalStories ?? []) {
    entries.push({
      id: slugify(`${domain}-optional-story-${s.name}`),
      type: 'pattern',
      domain,
      title: `Optional story: ${s.name}`,
      severity: 'suggestion',
      description: `When: ${s.when}. Shows: ${s.shows}`,
      tags: ['storybook', 'optional', 'stories'],
    });
  }

  // forbidden → anti-pattern entries
  for (const f of sb.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-forbidden-${f}`),
      type: 'anti-pattern',
      domain,
      title: `Storybook forbidden: ${f}`,
      severity: 'critical',
      description: f,
      tags: ['storybook', 'forbidden'],
    });
  }

  // stateRealMechanisms → rule entry
  if (sb.stateRealMechanisms) {
    const mechanisms = ['autoFocus', 'defaultChecked', 'disabled', 'ariaInvalid']
      .filter(k => sb.stateRealMechanisms[k])
      .map(k => `${k}: ${sb.stateRealMechanisms[k]}`)
      .join('; ');
    entries.push({
      id: slugify(`${domain}-state-real-mechanisms`),
      type: 'rule',
      domain,
      title: 'Use real HTML/React mechanisms for states',
      severity: 'critical',
      description: `${sb.stateRealMechanisms.description}. ${mechanisms}`,
      counterExample: (sb.stateRealMechanisms.forbidden ?? []).join('; '),
      tags: ['storybook', 'states', 'accessibility'],
    });
  }

  // mobileDeviceFrames → pattern entry
  if (sb.mobileDeviceFrames) {
    const iPhones = Object.entries(sb.mobileDeviceFrames.iPhoneModels ?? {})
      .map(([name, dims]: [string, any]) => `${name}: ${dims.width}x${dims.height}`)
      .join(', ');
    entries.push({
      id: slugify(`${domain}-mobile-device-frames`),
      type: 'pattern',
      domain,
      title: 'Mobile device frames for story testing',
      severity: 'suggestion',
      description: `${sb.mobileDeviceFrames.description}. iPhone models: ${iPhones}. Scale: ${sb.mobileDeviceFrames.scaleRequirement}`,
      tags: ['storybook', 'mobile', 'responsive', 'testing'],
    });
  }

  // masterStoryProtocol → pattern entry (critical)
  if (masterProtocol) {
    entries.push({
      id: slugify(`${domain}-master-story-protocol`),
      type: 'pattern',
      domain,
      title: 'Master story protocol: source of truth for page compositions',
      severity: 'critical',
      description: masterProtocol.purpose,
      example: `Naming: ${masterProtocol.naming?.pattern}. Examples: ${(masterProtocol.naming?.examples ?? []).join(', ')}`,
      why: (masterProtocol.benefits ?? []).join('; '),
      tags: ['storybook', 'master', 'protocol', 'api-contract'],
    });

    // API simulation rule
    if (masterProtocol.requirements?.apiSimulation) {
      const api = masterProtocol.requirements.apiSimulation;
      entries.push({
        id: slugify(`${domain}-master-api-simulation`),
        type: 'rule',
        domain,
        title: 'Master stories: use API hooks, never inline mocks',
        severity: 'critical',
        description: api.rule,
        why: api.why,
        example: api.correct?.join('; '),
        counterExample: api.forbidden?.join('; '),
        tags: ['storybook', 'master', 'api', 'mocking'],
      });
    }
  }

  // testing.mustHave → rule entries
  for (const item of testing.mustHave ?? []) {
    entries.push({
      id: slugify(`${domain}-test-must-have-${item}`),
      type: 'rule',
      domain,
      title: `Must have data-testid: ${item}`,
      severity: 'warning',
      description: `Elements that must have data-testid attributes: ${item}`,
      tags: ['storybook', 'testing', 'data-testid'],
    });
  }

  // testing.forbidden → anti-pattern entries
  for (const f of testing.forbidden ?? []) {
    entries.push({
      id: slugify(`${domain}-test-forbidden-${f}`),
      type: 'anti-pattern',
      domain,
      title: `Test ID anti-pattern: ${f}`,
      severity: 'warning',
      description: f,
      tags: ['storybook', 'testing', 'data-testid', 'anti-pattern'],
    });
  }

  // testing.dataTestIdByLayer → pattern entries
  if (testing.dataTestIdByLayer) {
    for (const [layer, data] of Object.entries(testing.dataTestIdByLayer)) {
      if (layer === 'description') continue;
      const d = data as any;
      if (typeof d === 'string') {
        entries.push({
          id: slugify(`${domain}-testid-layer-${layer}`),
          type: 'pattern',
          domain,
          title: `Test ID layer: ${layer}`,
          severity: 'suggestion',
          description: d,
          tags: ['storybook', 'testing', 'data-testid', layer],
        });
      } else {
        entries.push({
          id: slugify(`${domain}-testid-layer-${layer}`),
          type: 'pattern',
          domain,
          title: `Test ID layer: ${layer}`,
          severity: 'suggestion',
          description: `Format: ${d.format}`,
          example: (d.examples ?? []).join(', '),
          tags: ['storybook', 'testing', 'data-testid', layer],
        });
      }
    }
  }

  return entries;
}
