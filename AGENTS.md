## Package Manager

We use `pnpm` as our package manager. Never use `npm` or `npx` to run commands in this project. Instead, use the following commands:

- ✅️`node --run <task>` (since we use Node 22+)
- ✅️`pnpm exec <non-task-command>`
- ✅️`pnpm ...` (other than `pnpm run <task>`)
- ✅️`pnpx ...`
- 🤔`pnpm run <task>` (In simple cases, `node --run <task>` can suffice. You must provide a compelling reason to choose `pnpm run` over this alternative)
- ❌️`npm ...`
- ❌️`npx ...`

## Lint & Format

Make sure to run the following command every time you make changes to the codebase (Biome powered, and type check by TypeScript is NOT included):

```bash
node --run fix
```

## Type Check

Make sure to run the following command every time you make changes to `*.ts(x)` files:

```bash
node --run lint:type
```

## `packages/markdown-it-cj-friendly/src` can be touched only by collaborators or when fixing build/CI errors

`packages/markdown-it-cj-friendly` is deprecated and no longer maintained. Do not make any changes to this directory unless you want to fix build/CI errors or `gh repo view tats-u/markdown-cjk-friendly --json viewerPermission -q .viewerPermission` returns `ADMIN`, `MAINTAIN`, or `WRITE`. If you want to fix build/CI errors, try not to change the semantics of the code there.
