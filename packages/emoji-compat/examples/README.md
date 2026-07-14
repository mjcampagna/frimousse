# Emoji Compat Examples

This directory holds small checked-in example outputs for people reading the
repo.

`fallback-manifest-v15.sample.json` is a truncated sample of the manifest
generated from `emojibase-data/en/data.json` with:

```bash
pnpm --filter @slithy/emoji-compat build
pnpm --filter @slithy/emoji-compat assets:generate -- --version-floor 15 --manifest-out ./tmp/emoji-manifest.json
```

At the time this sample was captured, the full manifest contained:

- 139 fallback assets
- 44 base assets
- 95 skin assets

The sample keeps only the opening portion of that output so readers can inspect
the structure without checking in a large generated file.

`fallback-manifest-v15-no-skins.sample.json` is the matching base-only variant
generated with:

```bash
pnpm --filter @slithy/emoji-compat assets:generate -- --version-floor 15 --no-include-skins --manifest-out ./tmp/emoji-manifest-no-skins.json
```

At the time this sample was captured, the full base-only manifest contained:

- 44 fallback assets
- 44 base assets
- 0 skin assets
