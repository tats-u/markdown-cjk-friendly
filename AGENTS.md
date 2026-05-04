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
