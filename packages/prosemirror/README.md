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
  useEditorCursorPosition,
  useEditorState,
  useEditorView,
} from "@slithy/prosemirror";
```

- `createEditorInstance()` creates a minimal ProseMirror instance with a small
  subscription surface.
- `ProsemirrorEditor` mounts that instance from React.
- `useEditorCursorPosition()` tracks the current selection head and caret
  coordinates.
- `useEditorView()` and `useEditorState()` expose the mounted editor to
  descendant React components.
- `defaultSchema` re-exports a safe default starting schema from
  `prosemirror-schema-basic`.

## Lifecycle Notes

- `initialState`, `schema`, and `plugins` are treated as create-time inputs.
- `dispatchTransaction` is hot-swapped without recreating the editor view.
- If you need to replace the schema, plugin set, or initial state, recreate the
  `ProsemirrorEditor` component intentionally.
- If `initialState` is provided, it is the source of truth for the created
  editor state; top-level `schema` and `plugins` inputs are ignored for state
  creation.
- `editorProps` provides an additive passthrough for `DirectEditorProps` such as
  `editable`, `nodeViews`, or DOM event handlers.
- `createCursorSnapshot()` freezes the current cursor position and coordinates,
  which is useful for anchoring floating UI like typeaheads or mention menus
  while the user keeps typing.

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
