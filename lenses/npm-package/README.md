# awe-lens-npm-package

A **awe Lens** that renders any [npmjs.com](https://npmjs.com) package page as
a clean structured summary inside an awe chat.

## What it shows

Given a URL like `https://www.npmjs.com/package/express`, the lens returns:

```json
{
  "name": "express",
  "version": "5.0.1",
  "description": "Fast, unopinionated, minimalist web framework",
  "license": "MIT",
  "author": "TJ Holowaychuk",
  "homepage": "http://expressjs.com/",
  "repository": "https://github.com/expressjs/express",
  "keywords": ["express", "framework", "sinatra", "web", "http"],
  "dependency_count": 28,
  "weekly_downloads": 32145678
}
```

## Install

Inside awe (recommended):

```bash
awe-core lenses install https://github.com/awehq/community#lenses/npm-package
```

Or paste the URL into the **+ Add lens** dialog in the gateway sidebar's Lenses tab.

## How it works

- Pure public APIs — no scraping, no auth.
- `registry.npmjs.org/<package>` for metadata (license, deps, version)
- `api.npmjs.org/downloads/point/last-week/<package>` for download stats
- Both calls parallelized; download count is optional (lens still works if rate-limited).

## Permissions

| | |
|---|---|
| Network | `registry.npmjs.org`, `api.npmjs.org` |
| JS execution | none |
| Cookies | ephemeral (no auth) |
| Actions | none — display-only |

## License

MIT — see [LICENSE](LICENSE).

## Built for

[awe](https://awe.run) — the AI that lives in your browser.
Part of the [awe Lenses](https://github.com/awehq/community) community.
