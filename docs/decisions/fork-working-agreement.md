# Fork Working Agreement

## Goal

Build a fork that remains friendly to existing Frimousse consumers while giving us room to move independently when upstream is inactive or unresponsive.

Rebase-friendliness is still a useful guideline, but it is no longer the only or primary goal.

## Core Principles

1. **Prefer additive changes.**
   Add new files and new code paths instead of reshaping upstream code.

2. **Isolate new behavior in new files.**
   If a feature can live in a new module, put it there. New files have the lowest merge-conflict surface area.

3. **Touch upstream files at tiny call sites.**
   When an upstream file must change, make the insertion as small as possible. Favor a single import plus a single call over inlining feature logic.

4. **Extract before inserting.**
   If a change needs real logic, implement that logic in a new helper first, then call it from the upstream file.

5. **Prefer fork changes that stay locally containable.**
   A feature should usually be removable or revisable by changing a small set of fork-owned files and a few call sites.

6. **Do not refactor inherited code casually.**
   Avoid renames, reorganizations, broad cleanups, stylistic rewrites, and structural edits unless they clearly serve the fork's maintainability or product direction.

7. **Prefer justified divergence over accidental divergence.**
   If we diverge from upstream, do it intentionally for compatibility, maintainability, or feature reasons, not through incidental churn.

8. **Prefer extension over mutation for types.**
   Where possible, extend with intersections, wrappers, or fork-local types instead of rewriting upstream type definitions in place.

9. **Keep compatibility visible.**
   When making changes, be explicit about whether they preserve default consumer compatibility, add opt-in behavior, or intentionally diverge.

10. **Keep rebases legible when practical.**
   When two approaches are otherwise comparable, prefer the one that leaves future upstream rebases easier to understand and resolve.

## Working Rules

- Before editing an inherited file, ask: can this live in a new file instead?
- If an upstream file must change, keep the diff mechanically small and easy to review.
- Do not mix feature work with opportunistic cleanup.
- Do not rename existing symbols just to fit fork-specific behavior.
- Add tests for fork-specific behavior in fork-owned test files where possible.
- Document any intentionally added upstream touch points in checked-in feature docs or decision notes.
- When changing public API behavior, explicitly document the compatibility story.
- Document meaningful divergences so a future rebase can evaluate whether to keep the fork behavior, take upstream behavior, or combine them.

## Divergence Records

For any meaningful fork-specific change, capture enough context to support future rebase decisions:

- what changed
- why the fork diverged
- whether the divergence affects public API, internal behavior, packaging, or tooling
- whether the fork behavior should be preferred if upstream later touches the same area
- any known merge strategy or tradeoff

These notes do not need to be long, but they should make future conflict resolution an informed choice rather than archaeology.

## Decision Heuristic

When choosing between implementations, prefer the option that is:

1. More additive
2. More compatible for existing consumers
3. More isolated
4. Easier to maintain in the fork
5. Easier to rebase when the tradeoff is low

If a proposed change fails that test, pause and redesign it before implementation.
