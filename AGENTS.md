# AGENTS.md

Guidance for AI coding assistants working on CookShelf (Cursor, Claude Code, Aider, Copilot, etc.). Read this before making non-trivial changes.

## Project context

CookShelf is a personal recipe archive with AI-powered ingestion, scaling, nutrition estimation, and "Dish Story" generation. See [README.md](./README.md) for the product summary and [ARCHITECTURE.md](./ARCHITECTURE.md) for system design.

Single solo developer. Code should be production-quality but pragmatic — this is a real product targeting one real user (his mom) for v1, not a portfolio toy. Don't over-engineer.

## Tech stack

- TypeScript 5+, Node 20+
- Next.js 14 App Router (route handlers in `app/api/`)
- Prisma + Supabase Postgres
- Supabase Auth (Postgres-native, RLS-aware)
- Supabase Storage for recipe images
- Tailwind + shadcn/ui
- Anthropic SDK (Claude) for all AI features
- pnpm for package management
- vitest for tests

## Code conventions

- TypeScript `strict` mode. No `any` without a comment justifying it.
- Server-side: route handlers in `app/api/[resource]/route.ts`. Validate input with Zod.
- **Authorization is app-layer, not RLS.** Every route handler / server action starts with `const user = await requireUser()`. Every DB query goes through a scoped helper in `lib/db/<resource>.ts` that always includes `userId: user.id` in `where`. Direct `prisma.recipe.findMany()` from a route is forbidden. RLS is enabled on tables as a safety-net but does not fire under Prisma queries — do not rely on it.
- Database access goes through `lib/db.ts` (Prisma singleton) via the scoped helpers in `lib/db/`. Never import `PrismaClient` directly in routes or components.
- AI calls go through `lib/ai/` modules. One module per task: `extractRecipe.ts`, `estimateNutrition.ts`, `generateDishStory.ts`, `lookupIngredientDensity.ts`. Each module exports one function with a typed return.
- All Claude calls use structured outputs (tool use with a defined schema). No regex parsing of free-form responses.
- **Async work for v1 = synchronous endpoints.** Nutrition and Dish Story are fired by the client after save (`POST /api/recipes/:id/nutrition`, `POST /api/recipes/:id/dish-story`) and run synchronously inside normal route handlers. No background jobs, no `waitUntil`, no queue. Don't add one without discussion.
- **Image storage:** the DB stores object keys (`originalImagePath`), not URLs. Signed read URLs are minted at render time via `lib/supabase/storage.ts → signedUrlFor(path)`. Never persist a signed URL to the database.
- React: server components by default. Mark client components with `"use client"` only when state, effects, or browser APIs are needed.
- Forms: react-hook-form + Zod resolver.
- Errors: throw typed errors from server modules; let route handlers convert to HTTP. Show user-friendly messages on the client.
- Prefer named exports over default exports for shared modules.

## File layout

```
app/
  api/                    # route handlers
  (app)/                  # auth-gated app pages
  (marketing)/            # public landing
components/
  ui/                     # shadcn primitives
  recipe/                 # recipe-specific components
lib/
  db.ts                   # Prisma client singleton
  db/                     # scoped query helpers (always include userId in where)
  auth/
    requireUser.ts        # server-side helper: returns User or throws 401
  supabase/               # Supabase clients (server.ts, browser.ts, storage.ts)
  ai/                     # Claude call modules
  units/                  # volume↔weight conversion
  search/                 # FTS query builder
prisma/
  schema.prisma
  migrations/
  seed.ts                 # ingredient density seed
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build |
| `pnpm lint` | eslint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | vitest |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Seed ingredient densities |
| `pnpm db:studio` | Prisma Studio |

Always run `pnpm typecheck` and `pnpm test` before declaring a task done.

## Commit Conventions

Follow the Conventional Commits spec: `<type>(<scope>): <short description>`

Common types:
- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, config, tooling
- `docs` — documentation only
- `refactor` — code change that isn't a fix or feature
- `test` — adding or updating tests
- `style` — formatting, no logic change

Examples:
- `feat(auth): add JWT middleware for protected routes`
- `fix(prisma): resolve connection timeout on cold start`
- `chore(deps): upgrade express to 5.2.1`
- `docs(readme): add setup instructions and environment variables`
- `refactor(items): extract save logic into dedicated service`
- `test(auth): add unit tests for password hashing`

Rules:
- Keep subject line under 72 characters
- Use imperative mood — "add", not "added" or "adds"
- Lowercase after the colon
- No period at the end

- This follows the Conventional Commits spec, which is the most common standard in professional projects.  

## Pseudocode Guidelines

1. Comment **why**, not just **what**.
2. Use pseudocode only for **non-obvious logic**, not every simple line.
3. Prefer **short comments above a block** instead of line-by-line narration.
4. Keep comments **brief, specific, and direct**.
5. Use pseudocode to explain **flow, intent, business rules, or edge cases**.
6. Avoid comments that simply **repeat the code**.
7. Prefer **clear function and variable names** before adding extra comments.
8. Use pseudocode to explain **important assumptions** and **security-sensitive behavior**.
9. Remove or tighten **temporary learning comments** before finishing the file.
10. Keep comment style **consistent** across the project.
11. Update comments whenever the code changes so they do not go stale.
12. When a section needs too much explanation, consider **extracting a helper function** instead of adding more comments.

## Do

- Read [CookShelf-v1-design-doc.md](./CookShelf-v1-design-doc.md) before any non-trivial change to data models or AI pipelines.
- Update [TODO.md](./TODO.md) when you finish a task — check the box and (if a milestone) add it under "Done" with a date.
- Add a Prisma migration for any schema change. Never edit an existing migration after it's been applied.
- Write tests for unit conversion (`lib/units/`), recipe scaling, and any pure utility logic.
- Use seeded canonical ingredient names (case-insensitive lookup) before creating a new `Ingredient` row.
- When adding a Claude call, define the model name and prompt as exported constants. Log token usage for cost tracking.
- When proposing UI text, prefer "estimated" or "generated" over "AI". The user shouldn't have to think about which features are AI-powered.

## Don't

- Don't add a new dependency without checking whether shadcn/ui or an existing lib already covers it.
- Don't introduce a vector DB. Postgres FTS handles v1; pgvector is the v2 path.
- Don't bypass the `lib/ai/` layer to call Claude directly from a route handler or component.
- Don't fully normalize ingredient `rawText` ("2½ cups all-purpose flour, sifted") — keep the raw line and parse what you need into structured fields.
- Don't make `RecipeIngredient.quantity` non-nullable. Real recipes have "pinch", "to taste", "juice of 1 lemon". Use `quantityText` for non-numeric quantities.
- Don't store signed Storage URLs in the database. Store the object key (`originalImagePath`) and mint signed URLs at render time.
- Don't skip the `requireUser()` + scoped-query-helper pattern. RLS is *not* the guard for Prisma queries.
- Don't introduce background jobs, `waitUntil`, or a queue without explicit discussion. v1 uses synchronous endpoints fired by the client.
- Don't commit `.env*`, `AGENTS.local.md`, or anything in `.gitignore`.
- Don't disable `strict` TypeScript or `eslint` rules to make a task pass.
- Don't write to the database from a React Server Component — use a route handler or server action.
- Don't use the Supabase service-role key from the client or from any code path a client can reach. Service-role only in trusted server contexts (admin scripts, webhooks).

## Working style

- Small, focused commits. Schema change + matching seed update + matching migration go together.
- When changing a public function signature, search for callers and update them in the same change.
- When uncertain, leave a `// TODO(cookshelf):` comment with a one-line explanation rather than guessing.
- Don't refactor unrelated code while doing a feature.

## Personal / machine-specific notes

See [AGENTS.local.md](./AGENTS.local.md) (gitignored). Anything machine-specific or personal goes there, not here.
