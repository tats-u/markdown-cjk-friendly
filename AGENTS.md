## Package Manager

We use `pnpm` as our package manager. Never use `npm` or `npx` to run commands in this project. Instead, use the following commands:

- ✅️`node --run <task>` (since we use Node 22+)
- ✅️`pnpm exec <non-task-command>`
- ✅️`pnpm ...` (other than `pnpm run <task>`)
- ✅️`pnpx ...`
- ✅️ `pnpm -F <package> <command>` (to run a command in a specific package)
- ✅️ `pnpm -C <dir> <command>` (to run a command in a specific directory)
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

## Code Writing Policy

- Avoid inefficient code. Performance matters. Example:
  - BAD: `[...str].at(-1)` (O(n))
  - GOOD: Check `str.charCodeAt(str.length - 1)` and, if necessary, `str.charCodeAt(str.length - 2)`, and extract the required range (O(1))
- When checking surrogate code units, prefer `< 0xdc00` or `< 0xe000` over `<= 0xdbff` or `<= 0xdfff`.
- If external string input lacks specific character restrictions, assume it may contain supplementary characters U+10000 and above. Handle surrogate pairs correctly.
