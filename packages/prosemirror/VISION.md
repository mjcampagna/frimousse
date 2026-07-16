# Vision

`@slithy/prosemirror` is meant to be a focused React harness for ProseMirror, plus a small set of editor primitives that are worth owning directly.

It is not trying to be a universal editor framework. It is also not trying to hide ProseMirror behind a large abstraction layer. The goal is to make ProseMirror pleasant to use from React while keeping the underlying model visible, legible, and adaptable.

## Why This Exists

This package exists to provide an alternative to higher-level editor frameworks that feel too opaque, too broad, too brittle, or too externally constrained.

The intended outcome is a toolkit that:

- keeps the React integration story first-class
- stays close to ProseMirror's actual model
- exposes only the abstractions that earn their keep
- remains reusable across multiple editor-shaped products
- avoids framework surface area that exists only for theoretical completeness

## Package Thesis

The package should solve the parts of ProseMirror plus React that are genuinely awkward, while deliberately leaving the rest explicit.

That means:

- wrapping lifecycle and view integration where React and ProseMirror do not fit together naturally
- providing safe patterns for state access, transactions, effects, and event wiring
- supporting composable plugin, command, schema, and serialization setup
- making room for React-friendly node view patterns
- adding higher-level helpers only after they prove useful in real editor work

## Core Principles

- **ProseMirror stays visible.** Consumers should still be able to reason about `EditorState`, `Transaction`, plugins, schema nodes, and view behavior without fighting the package.
- **React is a first-class constraint.** The package should treat React integration as part of the design center, not as an afterthought layered on top.
- **Composition over monoliths.** The package should favor composable building blocks, in the spirit of Frimousse, rather than one giant editor surface that tries to do everything at once.
- **Human-readable and human-maintainable code is mandatory.** The package should stay legible to ordinary engineers. Abstractions should be named plainly, responsibilities should be easy to trace, and behavior should not disappear behind cleverness.
- **Abstractions must earn their keep.** If a helper does not make real editor work simpler, clearer, or safer, it should not exist.
- **Real usage beats speculative design.** The API should grow from repeated needs, not from trying to predict every future editor.
- **Consumer-agnostic does not mean feature-maximal.** Reusability should come from small, explicit primitives, not from pretending every product has the same needs.
- **Additive change over reinvention.** New capabilities should usually arrive as new modules or optional helpers, not by reshaping the entire package around each new use case.

## Composition Model

The package should try to use a composition model similar in spirit to Frimousse wherever that remains sane in a ProseMirror-heavy codebase.

That likely means:

- composing editor capabilities from small primitives
- keeping schema, plugins, commands, serialization, and React wiring as separable concerns
- letting consumers assemble an editor from parts rather than forcing one preset
- using tighter orchestration only where ProseMirror or React lifecycle complexity genuinely requires it

This should not become composition for its own sake. ProseMirror already brings enough complexity on its own. The goal is not maximal modularity. The goal is a package surface that stays understandable, flexible, and pleasant to work with.

## Readability Rule

The package should actively resist becoming obtuse.

That means:

- prefer plain functions and explicit data flow over hidden magic
- keep modules small enough that a human can actually reason about them
- favor names that describe behavior directly
- avoid abstractions that save a few lines at the cost of making control flow harder to follow
- treat "could another engineer maintain this without archaeology?" as a real acceptance criterion

If a design is technically elegant but makes the package harder to understand, it is probably the wrong design.

## Testing Rule

Testing should default to antagonistic testing, not just happy-path confirmation.

That means the package should deliberately test for:

- hostile or unstable parent rerenders
- lifecycle edge cases and cleanup behavior
- state preservation under stress
- invalid or conflicting configuration
- plugin and schema interaction hazards
- performance-sensitive update paths
- failure modes that could make the editor unreliable, slow, or unsafe

The goal is not test volume for its own sake. The goal is to make the package trustworthy under real-world pressure, not merely correct in ideal demos.

## Likely First Responsibilities

The first versions of the package will likely focus on:

- editor creation and lifecycle management
- React-safe access to editor state and dispatch
- plugin and command composition
- node view integration patterns
- schema assembly helpers
- serialization extension points
- a small set of opinionated behavior primitives such as key handling or paste composition

These are starting points, not a permanent boundary.

## Non-Goals

At least initially, this package is not trying to provide:

- a batteries-included full editor product
- a universal extension marketplace or plugin ecosystem
- an abstraction over every ProseMirror primitive
- a fixed answer for every schema, storage, or collaboration model
- broad API permanence before the package has real usage pressure

## How The Scope Can Move

The "parts we care about" may change over time. That is expected.

The package should be allowed to evolve as real editor work reveals which abstractions are durable and which are not. The goal is not to freeze the design too early. The goal is to keep a stable center while letting the useful edges emerge through use.

In practice, that means:

- core philosophy should stay relatively stable
- exported primitives can expand carefully
- higher-level helpers can be more experimental early on
- some ideas should be discarded if they do not hold up in real use

## Standard For New Surface Area

Before adding a new abstraction, we should usually be able to answer:

- what concrete pain point does this remove?
- does it make ProseMirror plus React easier to understand, or harder?
- is it reusable across more than one editor context we care about?
- can it stay additive instead of reshaping existing APIs?
- would a plain ProseMirror utility be clearer than a package-level abstraction?

If those answers are weak, the feature probably is not ready to become part of the package.
