# StartSnap Design System – Color Rules

## Why This Exists
A consistent color language helps users quickly understand what actions are possible, which information is important, and how to navigate the interface without friction.  Every color in the palette should have an explicit, single responsibility.

## Semantic Palette
| Token | Hex | Purpose |
|-------|-----|---------|
| `--color-primary` | `#EC4899` (startsnap-french-rose) | Main brand color. Use for primary CTAs, links, and highlights that drive core user actions. |
| `--color-secondary` | `#1D4ED8` (startsnap-persian-blue) | Secondary emphasis (alternate CTAs, link hovers, selected states). |
| `--color-success` | `#22C55E` (startsnap-mountain-meadow) | Positive actions & success feedback (e.g., "Pulse" notification, success badges). |
| `--color-warning` | `#FACC15` (startsnap-candlelight) | Warning & caution states. Use sparingly for attention without alarm. |
| `--color-error` | `#DC2626` | Destructive actions & error messaging. |
| `--color-surface` | `#FFFFFF` | Card & sheet surfaces. |
| `--color-surface-alt` | `#F3F4F6` | Alternate surface for subtle sections. |
| `--color-text-primary` | `#374151` | Default text on light surfaces. |
| `--color-text-inverse` | `#FFFFFF` | Text on primary & secondary backgrounds. |

> Dark-mode tokens mirror the same semantic names but map to dark values in the `.dark` selector.

## Usage Rules
1. **One Purpose per Color** – Never use the same token to mean multiple things.
2. **Buttons**
   * Primary action → `btn-primary` (uses `--color-primary`)
   * Secondary action → `btn-secondary` (border only, text colored)
   * Destructive → `btn-danger` (uses `--color-error`)
3. **Navigation Text Links** use default text color and become `--color-primary` on hover.
4. **Status Badges**
   * Success → `--color-success`
   * Warning → `--color-warning`
   * Error → `--color-error`
5. **Section Backgrounds**
   * Hero, split sections → use neutral surfaces and bring color with illustrations, not section bg unless functionally necessary.

## Tailwind Mapping (to be added in `tailwind.css`)
```css
:root {
  --color-primary: theme(colors.startsnap.french-rose);
  --color-secondary: theme(colors.startsnap.persian-blue);
  --color-success: theme(colors.startsnap.mountain-meadow);
  --color-warning: theme(colors.startsnap.candlelight);
  --color-error: #DC2626;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F3F4F6;
  --color-text-primary: #374151;
  --color-text-inverse: #FFFFFF;
}
```

## Migration Checklist
- [ ] Replace raw `bg-startsnap-french-rose` in components with `.btn-primary` or `text-primary` classes.
- [x] ~~Update `.startsnap-button` variants to consume tokens.~~ (Removed legacy system - using semantic Button component)
- [ ] Audit all components for raw color classes and swap them with semantic tokens.

---

_Last updated: 2025-06-23_