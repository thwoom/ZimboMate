# ADR-0001: Tailwind + Panda Coexistence & Responsibilities

- Status: Accepted
- Date: 2025-08-22
- Owners: @dan-h, @kate-l
- Context Tags: styling, ui, theming

## Context
We require both rapid layout utilities and a typed, design-system layer. Unchecked overlap between Tailwind and Panda causes inconsistency and drift. We also need image-free HUD chrome (Augmented-UI) while preserving accessibility.

## Decision
- **Tailwind CSS** is used **only** for layout/spacing/typography utilities.
- **Panda CSS** provides **all component shells** via typed recipes and variants.
- **Tokens** are defined in `design/tokens.css` (HSL variables) and are the single source of truth.
- **Augmented-UI** is applied on top of Panda shells for chrome (frames, seams, scanlines).
- Lint rule forbids raw color/spacing values in JSX and CSS outside tokens.

## Consequences
- Positive:
  - Strict separation reduces drift; easier to reason about styles.
  - Tokens ensure theming parity across Framer, Tailwind, Panda.
- Negative:
  - Slight overhead maintaining two style layers.
- Alternatives considered:
  - Tailwind-only (insufficient type-safety for shells).
  - Panda-only (slower for layout chores).
- Accessibility:
  - Radix focus styles remain visible; Augmented-UI must not obscure focus rings.
- Performance/Budgets:
  - No 3D or particles by default; optional effects behind flags.

## Implementation Plan
1. Create `design/tokens.css`; map to Tailwind config and Panda config.
2. Add ESLint rule to block raw hex/rgb/px for visual props.
3. Build Panda recipes for Button, Panel, Dialog, HUD Pill, Toolbar, Tabs, Slider.
4. Wrap Radix components with shadcn shells using Panda classes; layer Augmented-UI.
5. Storybook stories with Classic/Cosmic/Moebius; capture visual baselines.

## Rollback Plan
- If dev velocity suffers, trial a Panda “utility” recipe for common layout; reassess in ADR-0001A.
- Revert lint rule with a temporary allowlist during emergency fixes.

## References
- SPACE_HUD_PLAN.md sections: Vision & Experience; Coexistence Rules.
