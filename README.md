# Design System Knowledge

Pre-built intelligence bundles for Agent Forge agents — design system patterns, tokens, components, UX, accessibility.

## Available Bundles

| Domain | Entries | Covers |
|--------|---------|--------|
| `design-tokens` | 36 | Token selection priority, forbidden patterns, styling rules, component guidance |
| `components` | 125 | Variant philosophy, API constraints, atomic architecture, shadcn catalog, stabilization, clean code |
| `storybook` | 27 | Required/optional stories, testing patterns, master story protocol, device frames |
| `accessibility` | 32 | A11y violations, keyboard navigation, screen readers, color contrast, touch targets |
| `typography` | 22 | Type scale, golden rules, font requirements, iconography |
| `spacing` | 41 | Two-layer system, spacing tokens, layout anti-patterns, border radius |
| `color-system` | 27 | Context-aware colors, harmony principles, depth layering, dark mode |
| `ux-patterns` | 75 | 15 UX laws, gestalt principles, defensive design, dialog patterns, UX writing, performance |

**Total: 385 entries across 8 domains**

## Usage

```bash
# Copy bundles into your agent project
cp bundles/*.json /path/to/your/agent/knowledge/

# Or reference directly
cat bundles/components.json | jq '.entries | length'
```

## Bundle Format

Each bundle is a JSON file with this structure:

```typescript
interface IntelligenceBundle {
  domain: string;
  version: string;
  entries: IntelligenceEntry[];
}

interface IntelligenceEntry {
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
```

## Regenerating Bundles

Requires the Salvador intelligence source data.

```bash
npm install
SALVADOR_DATA=/path/to/salvador/intelligence/data npm run build
npm run validate
```
