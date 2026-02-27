# Design System Knowledge

Give your AI agent design system expertise — instantly.

385 curated intelligence entries covering design tokens, components, accessibility, color, spacing, typography, UX patterns, and Storybook. Each entry is a structured JSON object with severity, examples, and counter-examples. Drop them into any [Agent Forge](https://github.com/Spilno-me/agent-forge) agent's knowledge directory and it knows what you know.

## What's inside

| Bundle | Entries | What your agent learns |
|--------|---------|----------------------|
| **design-tokens** | 36 | Token selection priority, forbidden raw values, styling rules |
| **components** | 125 | Variant philosophy, API constraints, atomic architecture, shadcn/ui catalog |
| **storybook** | 27 | Required and optional stories, testing patterns, device frames |
| **accessibility** | 32 | WCAG violations, keyboard navigation, screen readers, color contrast, touch targets |
| **typography** | 22 | Type scale, font requirements, iconography, golden rules |
| **spacing** | 41 | Two-layer spacing system, layout anti-patterns, border radius tokens |
| **color-system** | 27 | Context-aware colors, harmony principles, depth layering, dark mode |
| **ux-patterns** | 75 | 15 UX laws, gestalt principles, defensive design, dialog patterns, UX writing |

## Quick start

### Install into an Agent Forge agent

Copy the bundles into your agent's intelligence directory:

```bash
cp bundles/*.json /path/to/your-agent/src/intelligence/data/
```

Then rebuild your agent:

```bash
cd your-agent
npm run build
```

Your agent now has design system knowledge available through its vault search and pattern matching.

### Use standalone

The bundles are plain JSON — no dependencies, no build step. Use them however you like:

```bash
# Count entries in a bundle
cat bundles/components.json | jq '.entries | length'
# 125

# Find all critical rules
cat bundles/color-system.json | jq '.entries[] | select(.severity == "critical") | .title'

# Search by tag
cat bundles/accessibility.json | jq '.entries[] | select(.tags | index("contrast")) | .title'
```

## Entry format

Every entry follows the same structure. Required fields are always present. Optional fields appear when the entry has relevant examples or context.

```typescript
interface IntelligenceEntry {
  // Always present
  id: string;                                      // Unique across all bundles
  type: 'pattern' | 'anti-pattern' | 'rule';       // What kind of knowledge
  domain: string;                                   // Which bundle it belongs to
  title: string;                                    // Human-readable name
  severity: 'critical' | 'warning' | 'suggestion';  // How important
  description: string;                              // The actual guidance
  tags: string[];                                   // For search and filtering

  // Present when applicable
  context?: string;       // When or where this applies
  example?: string;       // The right way to do it
  counterExample?: string; // The wrong way (and why)
  why?: string;           // Rationale behind the rule
  appliesTo?: string[];   // Specific components or contexts
}
```

### Entry types

| Type | Meaning | Example |
|------|---------|---------|
| `pattern` | Recommended approach | "Color context: card — use `bg-white` in light, `bg-primary-800` in dark" |
| `anti-pattern` | Known mistake to avoid | "Raw hex colors — breaks design system, not maintainable" |
| `rule` | Hard requirement | "Text on backgrounds must meet WCAG AA (4.5:1) minimum" |

### Severity levels

| Level | When it matters |
|-------|----------------|
| `critical` | Must follow. Violating this breaks accessibility, consistency, or functionality |
| `warning` | Should follow. Ignoring this leads to UX debt or maintenance problems |
| `suggestion` | Good to follow. Improves quality but won't break anything if skipped |

## What the bundles cover

### design-tokens (36 entries)

Token selection priority, forbidden patterns (raw hex, standard Tailwind colors), styling rules, and component-level guidance for applying the right token in the right context.

### components (125 entries)

The largest bundle. Covers variant philosophy (semantic vs. cosmetic), API constraints (prop limits, composition rules), atomic architecture levels, the full shadcn/ui component catalog (59 components with accepted variants), stabilization patterns, and clean code rules.

### storybook (27 entries)

Required story types, optional enhancements, forbidden patterns, device frames for mobile testing, the master story protocol, and data-testid conventions by architectural layer.

### accessibility (32 entries)

WCAG AA compliance rules, common violations, keyboard navigation requirements, screen reader patterns, color contrast rules, and touch target sizing from Fitts's Law.

### typography (22 entries)

Type scale definitions, golden rules for typography, font format and weight requirements, and iconography sizing with forbidden patterns (no emoji as icons).

### spacing (41 entries)

The two-layer spacing system (component-internal and layout-external), all spacing tokens, six named layout anti-patterns, border radius tokens, and the nested component formula.

### color-system (27 entries)

Six color contexts (page, card, surface, button, input, badge), three harmony principles, forbidden color usage, five depth layers with anti-patterns, and the dark mode formula with semantic token mappings.

### ux-patterns (75 entries)

15 core UX laws (Fitts, Hick, Miller, Doherty, and more), gestalt principles, button color semantics, action overflow rules, validation layer architecture, graceful degradation, dialog/container selection by complexity, UX writing patterns, and response time thresholds.

## Building from source

If you have access to the Salvador intelligence source data and want to regenerate the bundles:

```bash
npm install
SALVADOR_DATA=/path/to/salvador/intelligence/data npm run build
npm run validate
```

The build reads 20+ source JSON files, extracts and normalizes entries, deduplicates IDs across all bundles, and writes the output to `bundles/`.

Validation checks every entry for required fields, valid enums, non-empty values, and unique IDs both within and across bundles.

## License

MIT
