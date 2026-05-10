---
name: update-pnpm-pinning
description: Read this if trying to change the pnpm version in `packageManager` field in `package.json`.
---

# pnpm version choice

The latest major version of pnpm is 11, but it supports only Node 22+. We want to support Node 20 (and 18). Therefore, stick to pnpm 10.x for now unless the requester tells you that they want to drop support for Node 20 (or lower).

The minimum required version of Node can be found in the `engines` field in `package.json` of `package.json` of packages (in the `packages/` directory).
