---
name: fetch-markdown-specs
description: Read if you want to refer to the CommonMark/GFM specifications
user-invocable: false
---

Since CommonMark and GFM specifications exist as files in GitHub repositories, you should fetch them by either:

- `get_file_contents` in GitHub MCP Server
- GitHub CLI (if its version is 2.95 or greater, you should use `gh repo read-file <path> -R <owner>/<repo>`)

| Flavor | Repository | Path |
| --- | --- | --- |
| CommonMark | commonmark/commonmark-spec | /spec.txt |
| GFM | github/cmark-gfm | /test/spec.txt |

Standard fetchers like cURL lack authentication credentials and are more likely to hit rate limits, so we strongly recommend avoiding their use whenever possible.
