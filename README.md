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


