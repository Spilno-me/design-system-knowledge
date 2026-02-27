# Design System Knowledge

Structured design system intelligence for AI agents and developer tooling.

470 curated entries covering design tokens, components, accessibility, color systems, spacing, typography, UX patterns, and Storybook. Each entry is a structured JSON object with severity, examples, and counter-examples — ready to drop into any AI agent, linter, or code review tool that works with component-driven development and design systems.

Built for teams using **Tailwind CSS**, **shadcn/ui**, and **Storybook** with a token-based design system.

## What's inside

| Bundle | Entries | What it covers |
|--------|---------|---------------|
| **design-tokens** | 41 | Token selection priority, forbidden raw values, styling rules |
| **components** | 145 | Variant philosophy, API constraints, atomic architecture, shadcn/ui catalog |
| **storybook** | 42 | Required and optional stories, testing patterns, device frames |
| **accessibility** | 42 | WCAG violations, keyboard navigation, screen readers, color contrast, touch targets |
| **typography** | 27 | Type scale, font requirements, iconography, golden rules |
| **spacing** | 46 | Two-layer spacing system, layout anti-patterns, border radius tokens |
| **color-system** | 32 | Context-aware colors, harmony principles, depth layering, dark mode |
| **ux-patterns** | 95 | 15 UX laws, gestalt principles, defensive design, dialog patterns, UX writing |

## Quick start

### Install into an Agent Forge agent

If you have [Agent Forge](https://github.com/Spilno-me/agent-forge) registered as an MCP server, one command installs all 470 entries into an existing agent — validates bundles, copies data files, generates domain facades, patches source files, and rebuilds:

```
forge op:install_knowledge params:{
  agentPath: "/path/to/your-agent",
  bundlePath: "/path/to/design-system-knowledge/bundles"
}
```

This requires Agent Forge to be registered with Claude Code:

```bash
claude mcp add --scope user agent-forge -- node /path/to/agent-forge/dist/index.js
```

After installing and restarting Claude Code, your agent will have 8 new domain facades and a vault seeded with all the knowledge.

### Copy the bundles manually

The bundles are plain JSON files — no dependencies, no build step. Copy them wherever you need them:

```bash
# Clone and copy
git clone https://github.com/Spilno-me/design-system-knowledge.git
cp design-system-knowledge/bundles/*.json /path/to/your/project/knowledge/
```

### Use as a git submodule

```bash
git submodule add https://github.com/Spilno-me/design-system-knowledge.git knowledge/design-system
```

### Fetch individual bundles

```bash
# Grab just what you need
curl -O https://raw.githubusercontent.com/Spilno-me/design-system-knowledge/main/bundles/components.json
curl -O https://raw.githubusercontent.com/Spilno-me/design-system-knowledge/main/bundles/accessibility.json
```

## Working with the data

Each bundle is a JSON file you can query, filter, and integrate however you like:

```bash
# Count entries in a bundle
cat bundles/components.json | jq '.entries | length'
# 125

# Find all critical rules
cat bundles/color-system.json | jq '.entries[] | select(.severity == "critical") | .title'

# Search by tag
cat bundles/accessibility.json | jq '.entries[] | select(.tags | index("contrast")) | .title'

# Get all anti-patterns across bundles
cat bundles/*.json | jq '.entries[] | select(.type == "anti-pattern") | {id, title, severity}'
```

### Use in code

```typescript
import tokens from './knowledge/design-tokens.json';
import components from './knowledge/components.json';

// Find critical rules for a specific domain
const criticalRules = components.entries.filter(
  e => e.severity === 'critical' && e.type === 'rule'
);

// Search by tag
const a11yContrast = tokens.entries.filter(
  e => e.tags.includes('contrast')
);
```

## Entry format

Every entry follows a consistent structure. Required fields are always present. Optional fields appear when the entry has relevant examples or context.

```typescript
interface IntelligenceEntry {
  // Always present
  id: string;                                       // Unique across all bundles
  type: 'pattern' | 'anti-pattern' | 'rule';        // What kind of knowledge
  domain: string;                                    // Which bundle it belongs to
  title: string;                                     // Human-readable name
  severity: 'critical' | 'warning' | 'suggestion';   // How important
  description: string;                               // The actual guidance
  tags: string[];                                    // For search and filtering

  // Present when applicable
  context?: string;        // When or where this applies
  example?: string;        // The right way to do it
  counterExample?: string; // The wrong way (and why)
  why?: string;            // Rationale behind the rule
  appliesTo?: string[];    // Specific components or contexts
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

## Bundle details

### design-tokens (41 entries)

Token selection priority (semantic → contextual → primitive), forbidden patterns (raw hex, standard Tailwind colors, inline styles), auto-fix recommendations for common violations, and component-level token guidance for buttons, cards, inputs, and badges.

### components (145 entries)

The largest bundle. Variant philosophy (semantic vs. cosmetic naming), the 3-3-3 rule for component APIs, pre-build gates, composition rules (forbidden nesting patterns), atomic architecture levels (atom → molecule → organism → template), the full **shadcn/ui component catalog** with accepted variants and installation commands, stabilization patterns (safe vs. breaking changes), and clean code constraints (function size, file limits).

### storybook (42 entries)

Required story types per component, optional enhancements, forbidden patterns, the master story protocol for API simulation, device frames for mobile testing, and `data-testid` conventions by architectural layer.

### accessibility (42 entries)

WCAG AA compliance rules, common violations (missing labels, poor focus management), keyboard navigation requirements, screen reader patterns (ARIA roles, live regions), color contrast rules, and touch target sizing based on Fitts's Law.

### typography (27 entries)

Type scale definitions, golden rules for typography (hierarchy, readability, consistency), font format and weight requirements, and iconography sizing with forbidden patterns.

### spacing (46 entries)

The two-layer spacing system (component-internal padding and layout-external margins), all spacing tokens, six named layout anti-patterns, border radius tokens, and the nested component spacing formula.

### color-system (32 entries)

Six color contexts (page, card, surface, button, input, badge), three harmony principles (WCAG contrast, same-family shade gaps, semantic consistency), forbidden color usage, five depth layers with anti-patterns, and the dark mode formula with semantic token mappings.

### ux-patterns (95 entries)

15 core UX laws (Fitts's, Hick's, Miller's, Doherty threshold, and more), four gestalt principles, button color semantics, action overflow rules, validation layer architecture, graceful degradation levels, dialog and container selection by field complexity, UX writing patterns (buttons, errors, empty states, forms, loading, warnings), and response time thresholds.

## License

MIT
