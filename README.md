# awe community

Everything people write for [awe](https://awe.run) lives here, so awe can do
more without us writing all of it.

| Folder | What it is | Read by |
|---|---|---|
| `skills/` | Skills you can install from awe's catalog. `skills/index.json` is the catalog. | `awe-core skill install <id>` and the console's catalog |
| `lenses/` | Lenses: cards that show a page you are on in a cleaner way. `lenses/index.json` is the directory. | the console's lens directory |
| `apps/` | Sign-in presets for apps awe can connect to. awe ships its own copy; add new ones here. | the next awe release |
| `recipes/` | Errand recipes: the steps for doing something on a website. (Coming soon.) | awe's errand runner |
| `schema/` | The shapes every file above is checked against. | CI on every pull request |

## Add something

Open a pull request. CI checks it against `schema/`, and someone from awe
reviews it. Anything that touches money, travel, accounts or health always
gets a review from awe before it merges. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache-2.0. Copyright 2026 Awe Labs Inc. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
