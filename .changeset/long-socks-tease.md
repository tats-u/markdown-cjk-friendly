---
"markdown-it-cjk-friendly": major
---

BREAKING: bump `@types/markdown-it` to 14.2.0+ and/to improve type compatibility with markdown-it v15.

To stay compatible with the built-in types in markdown-it v15, I raised the minimum required version of `@types/markdown-it`.

The JS code to be executed by the runtime is not changed. Only the type definitions are updated to be compatible with the latest versions of markdown-it and `@types/markdown-it`.

If you do not use TypeScript or do not care about types:\
If you are using markdown-it v1**5**:

__No modifications are required in your code.__ Feel free to add an entry to upgrade v2.x versions of `markdown-it-cjk-friendly` to this major version in `overrides` or upgrade them directly installed to your package/app to this major version. Your code will continue to work as before without breaking changes.

Here is an example of how to add an entry to `overrides` in your `pnpm-workspace.yaml`:

```yaml
overrides:
  markdown-it-cjk-friendly@^2: ^3
```

If you are using markdown-it v1**4**:

The same generally applies. If you are told that the version of `@types/markdown-it` does not satisfy the peer dependencies, please update it to the latest version.

If you are using markdown-it v1**3**:

__Please upgrade markdown-it to v14 or newer.__ v13 does not comply with the latest CommonMark required by this amendment/extension. That said, upgrading only `@types/markdown-it` to the latest major version is also fine.

