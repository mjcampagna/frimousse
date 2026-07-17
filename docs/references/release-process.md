# Release Process

This repository uses Changesets for versioning and npm publishing, but GitHub
Releases are still created manually.

## Guardrails

- `@slithy/prosemirror` is intentionally ignored by Changesets in
  [.changeset/config.json](/Users/mjcampagna/Code/frimousse/.changeset/config.json:1).
- That package should not be included in routine publish batches from this
  workspace.
- If we intentionally decide to release it in the future, remove it from the
  Changesets `ignore` list as part of that launch work instead of publishing it
  incidentally.

## Publish flow

1. Add or update Changesets for every publishable package change.
2. Run `pnpm changeset version`.
3. Commit the version and changelog updates.
4. Publish packages with:

   ```bash
   npm_config_userconfig=~/.npmrc pnpm changeset publish
   ```

5. Push commits and tags:

   ```bash
   git push
   git push --tags
   ```

6. Create a GitHub Release for the publish batch.

## GitHub Releases

Use one repo-level GitHub Release per publish batch, attached to the main
`@slithy/frimousse@...` tag for that batch.

The release body should list every package version included in the publish.
Keep the GitHub Release title short and conventional, such as `v0.4.1`.

Example:

```md
Title:
v0.4.1

Published packages:
- `@slithy/frimousse@0.4.1`
- `@slithy/emoji-transforms@0.1.1`

Highlights:
- `@slithy/frimousse`
  - adds root-controlled picker search
  - adds a staging CLI for self-hosted Emojibase data
  - expands FAQ and API docs for offline-capable/self-hosted emoji data delivery

- `@slithy/emoji-transforms`
  - adds locale-fallback native search helpers for building term maps from secondary Emojibase datasets
```

## Retroactive release

Initial workspace release:

- tag: `@slithy/frimousse@0.4.0`
- title: `v0.4.0`
- included packages:
  - `@slithy/frimousse@0.4.0`
  - `@slithy/emoji-transforms@0.1.0`
  - `@slithy/emoji-compat@0.1.0`
