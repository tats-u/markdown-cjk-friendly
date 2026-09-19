---
name: update-unicode-version
description: Read when updating the project to a newer Unicode version and regenerate the derived range data.
---

1. Find hard-coded Unicode version references in scripts, generated data, generated docs, and the Marked plugin regex in `packages/marked-cjk-friendly/src/index.ts`.
2. Update the default version in `scripts/cjk-ranges.ts` to the target Unicode version.
3. Regenerate the derived data with:
   - `node --run print-ranges -- -u <version>`
   - `node --run print-ranges -- -l ranges.md -u <version>`
4. Update any docs, comments, and regex ranges that still mention the old version.
5. Add a changeset for the package that changed, typically `marked-cjk-friendly`, so the release is tracked. Message example: "Update the CJK character ranges to Unicode [version]"
6. Run the smallest relevant validation command, such as `pnpm --filter marked-cjk-friendly test`.

Done when:
- all relevant version references use the target Unicode version;
- generated range output and the Marked plugin regex are refreshed and match the new version;
- the changeset for the package is present;
- the relevant tests pass.
