# UI Refactor Brainstorm

## Problem

The editor UI is functional but visually rough. Current implementation uses scattered inline styles across shell, panels, and viewport packages, with no shared design tokens or reusable UI primitives. This makes polish inconsistent and future UI changes expensive.

## Current UI Surface

- `apps/editor/src/EditorApp.tsx` wires the editor shell, viewport, hierarchy, inspector, asset browser, and script editor.
- `packages/@pwe/editor-shell/src/App.tsx` owns panel chrome and placeholder containers.
- `packages/@pwe/editor-shell/src/PanelLayout.tsx` owns the resizable editor layout.
- `packages/@pwe/editor-shell/src/Toolbar.tsx` owns top-level commands and play state display.
- `packages/@pwe/editor-panels/src/*Panel.tsx` owns hierarchy, inspector, assets, and script UI.
- `packages/@pwe/editor-viewport/src/Viewport.tsx` owns the viewport wrapper and mode switching.
- `apps/editor/index.html` contains only global reset/background styling.

## Evaluated Approaches

### 1. Visual polish only

Improve existing inline styles directly: better colors, spacing, borders, buttons, empty states.

Pros:
- Fastest visible improvement.
- Low architectural risk.
- Minimal package churn.

Cons:
- Keeps styling duplicated.
- Future panels will repeat the same inline-style problem.
- Harder to enforce a coherent editor look.

### 2. UX layout refactor

Rework toolbar grouping, panel hierarchy, bottom panel composition, empty states, and selection affordances.

Pros:
- Improves usability, not just appearance.
- Can make the editor feel more professional quickly.

Cons:
- Larger behavior surface.
- Requires more design decisions around workflows.
- Still needs a style foundation or it becomes another one-off pass.

### 3. Design system foundation

Introduce a small pro-editor design system: tokens, reusable primitives, panel chrome, toolbar controls, form fields, empty states, and then migrate existing UI incrementally.

Pros:
- Best long-term maintainability.
- Reduces duplicated inline styles.
- Gives all current and future editor panels a consistent Unity/Figma/VS Code-like feel.
- Supports later UX/layout improvements without restyling from scratch.

Cons:
- More initial structure than pure polish.
- Requires discipline to keep primitives small and avoid overbuilding.

## Recommendation

Use approach 3: design system foundation, with a pro-editor visual direction.

Target look:
- Dark professional editor shell.
- Dense but readable controls.
- Clear panel hierarchy, stronger selection/focus states.
- Consistent spacing, border, typography, and input treatment.
- Minimal motion; prioritize usability over flashy effects.

## Implementation Considerations

Keep the first implementation small:

- Add shared design tokens for color, spacing, typography, radius, border, and interaction states.
- Add focused primitives only where existing UI already needs them: `Button`, `Panel`, `PanelHeader`, `Input`, `EmptyState`, `ToolbarGroup`.
- Replace inline styles in shell first, then migrate panels.
- Avoid adding a large third-party UI kit unless a future need justifies it.
- Preserve existing editor behavior while changing presentation.

## Risks

- Over-abstracting too early: avoid generic component APIs not needed by current UI.
- Visual-only refactor missing usability issues: include empty states and interaction states in the first pass.
- Inline-style leftovers: define migration boundaries per package to avoid half-consistent UI.

## Success Metrics

- Shared tokens replace repeated hardcoded colors like `#1e1e1e`, `#252526`, `#333`, `#444`.
- Toolbar, panel chrome, hierarchy, inspector, and asset browser use shared primitives.
- Editor still builds and runs with the same behavior.
- UI has consistent hover, selected, disabled, empty, and focus states.

## Next Step

Create an implementation plan for the design-system-first refactor, starting with editor shell primitives and migrating panels incrementally.
