# Changesets

This repository uses Changesets for all publishable packages under `packages/` except
`markdown-it-cj-friendly`.

## Daily workflow

1. Add a changeset with `node --run changeset`.
2. Merge the PR into:
   - `main` for stable releases
   - `next` for prereleases published to npm dist-tag `next`
3. Let the release workflow open or update the version PR.

Keep `.changeset/pre.json` on `next` only. Stable releases on `main` intentionally fail if that prerelease
state leaks over.

`markdown-it-cj-friendly` is intentionally excluded from this flow and is kept private to avoid
accidental publishes.
