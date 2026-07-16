# @slithy/prosemirror

Scaffolding for a focused React harness around ProseMirror.

This package is intentionally minimal today. Its current role is to provide a
clean package boundary, local build/test tooling, and a stable place to grow
editor-specific code without coupling that work to the rest of the Frimousse
codebase.

That boundary is deliberate: the package currently lives inside the Frimousse
monorepo, but it is being structured so it can be split into its own repository
later with minimal reshaping.

## Current status

- Package scaffolded
- Planning and reference docs checked in under `docs/`
- First harness slice implemented:
  - barebones `EditorView` creation
  - React mount component
  - context and hook-based state/view access

## Installation

```bash
pnpm add @slithy/prosemirror
```

## Shipped surface

```ts
import {
  ProsemirrorEditor,
  createEditorInstance,
  defaultSchema,
  useEditorState,
  useEditorView,
} from "@slithy/prosemirror";
```

- `createEditorInstance()` creates a minimal ProseMirror instance with a small
  subscription surface.
- `ProsemirrorEditor` mounts that instance from React.
- `useEditorView()` and `useEditorState()` expose the mounted editor to
  descendant React components.
- `defaultSchema` re-exports a safe default starting schema from
  `prosemirror-schema-basic`.

## Development

- Source: `src/`
- Playground: `playground/`
- Planning notes: `docs/`
- Package-local tests: `src/**/*.test.ts`

Run the local playground with:

```bash
pnpm dev:playground
```

The current planning document is:

- [`docs/prosemirror_editor_starter_guide.md`](./docs/prosemirror_editor_starter_guide.md)
