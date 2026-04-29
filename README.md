# CookShelf

A personal recipe archive that understands food, preserves its history, and adapts it to your needs.

## What it does


Snap a photo of a recipe — handwritten card, cookbook page, web printout. CookShelf reads it, structures it, estimates nutrition, generates a "Dish Story" with cultural and historical context, and remembers where it came from. Search by ingredient, cuisine, calorie range, dietary tag, or family source. Scale servings up or down and the math (and nutrition) recomputes. Toggle between volume and weight per ingredient.

## Core features

- Extract recipes from photos (Claude Vision)
- Scale servings automatically
- Convert volume ↔ weight measurements
- Estimate nutrition per serving
- Generate cultural + historical dish context ("Dish Story")
- Track recipe provenance (family, cookbook, website, handwritten)
- Search by ingredient, cuisine, diet, calorie range, or source

## Status

Pre-development. v1 design is locked. Build begins on Day 1 of the [4-week MVP plan](./TODO.md).

## Tech stack at a glance

- Next.js 14 (App Router) + Tailwind + shadcn/ui
- Supabase — Postgres, auth, and object storage in one provider
- Prisma (ORM, migrations) + Supabase Auth + Supabase Storage
- Anthropic Claude for recipe extraction, nutrition estimation, Dish Story, and density lookups

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full picture and rationale.

## Deployment architecture

- Frontend + API: Vercel
- Database/Auth/Storage: Supabase
- AI: Anthropic Claude

## Getting started

> Filled in once Week 1 is done. Placeholder for now.

```bash
git clone <repo-url>
cd cookshelf
pnpm install
cp .env.example .env.local   # fill in Supabase + Anthropic keys
pnpm db:migrate
pnpm db:seed                  # seeds top ~100 ingredient densities
pnpm dev
```

## Tooling conventions

- The project is configured as ES modules with `"type": "module"` in `package.json`.
- Use `pnpm dev` for the app server.
- Use `pnpm dev:all` when you want the app server and Prisma Studio running together via `concurrently`.

## Project docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design, tech stack, key decisions
- [ROADMAP.md](./ROADMAP.md) — what's planned beyond v1
- [TODO.md](./TODO.md) — current working task list
- [AGENTS.md](./AGENTS.md) — guidance for AI coding assistants
- [CookShelf-v1-design-doc.md](./CookShelf-v1-design-doc.md) — original full design doc with wireframes and rationale

## License

TBD.

## Screenshots

_(coming soon — UI wireframes in design doc)_

## Commit Conventions

This project uses the Conventional Commits format:

`<type>(<scope>): <short description>`

Common types:
- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, config, tooling
- `docs` — documentation only
- `refactor` — code change that is not a fix or feature
- `test` — adding or updating tests
- `style` — formatting only, no logic change

Examples:
- `feat(auth): add JWT middleware for protected routes`
- `fix(prisma): resolve connection timeout on cold start`
- `docs(readme): add setup instructions`
- `refactor(items): extract save logic into service`
- `test(auth): add unit tests for password hashing`

Guidelines:
- Keep the subject line under 72 characters
- Use imperative mood, such as `add` or `fix`
- Use lowercase after the colon
- Do not end the subject with a period

## Comment and Pseudocode Guidelines

Use comments to improve clarity, not to narrate obvious code.

Guidelines:
- Comment **why**, not just **what**
- Use comments only for **non-obvious logic**
- Prefer **short comments above a block** over line-by-line commentary
- Keep comments **brief, specific, and direct**
- Use comments for **flow, intent, business rules, edge cases, and security-sensitive behavior**
- Avoid comments that simply **repeat the code**
- Prefer **clear names** before adding extra comments
- Remove temporary learning comments before considering a file finished
- Keep comment style **consistent** across the project
- Update comments when code changes so they do not become stale
- If a section needs too much explanation, consider extracting a helper function


## Pull Request Description Format

When opening a pull request, use the following format:

```md
## Summary

Briefly explain what this pull request does.

## Changes

- List the main changes made in this PR
- Keep each bullet short and specific
- Focus on what changed, not every tiny implementation detail

## Testing

- Explain how the change was tested
- If no tests were run, explain why
```

### Example

```md
## Summary

Adds a Git workflow practice section to the README.

## Changes

- Documents the engineer workflow
- Documents the reviewer workflow
- Adds cleanup steps after merge

## Testing

- Not run; documentation-only change
```
