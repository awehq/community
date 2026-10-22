# Contributing to awe community

Thanks for helping. A contribution is one pull request that adds or changes
one thing: a skill, a lens, a sign-in preset or (soon) an errand recipe.

1. **Copy the template** for what you are adding:
   - a skill: any folder in `skills/` (a `SKILL.md`, plus `actions.json` if it runs steps);
   - a lens: any folder in `lenses/` (`manifest.json`, `index.js`, `README.md`), plus its entry in `lenses/entries/`;
   - a sign-in preset: `apps/presets/_template.json`.
2. **Check it locally:** `node scripts/validate-catalog.mjs` for skills, or
   `node apps/scripts/validate-presets.mjs` for presets.
3. **Open a pull request.** Say what it does and how you tried it.

Rules:
- Never include anything personal: no names, emails, phone numbers,
  addresses, tokens or screenshots of your accounts.
- Skills and lenses only use the permissions they name.
- By opening a pull request you agree your contribution is licensed under
  Apache-2.0, like the rest of this repository.
