# CookShelf — TODO

Working task list. Check things off as you ship them. New ideas go in **Backlog** at the bottom; once something is queued for a milestone, move it up.

## Day 0 — Settled architectural patterns (read before coding)

These are the three decisions that bite later if you fudge them now. Confirmed in [DESIGN.md §6](./DESIGN.md) and [ARCHITECTURE.md](./ARCHITECTURE.md). Don't drift from them without an explicit decision.

- [ ] **Identity:** `User.id` is a `uuid` mirroring `auth.users.id`. No `cuid()`. Postgres trigger creates the User row on signup.
- [ ] **Authorization:** Prisma is the only DB layer; bypasses RLS. App-layer guard is `requireUser()` + scoped `lib/db/<resource>.ts` helpers. RLS exists as documentation/safety-net on tables and as the *real* guard on Storage.
- [ ] **Async work:** Nutrition + Dish Story are synchronous endpoints fired by the client after save (parallel). No queue, no `waitUntil`, no jobs.

## Pre-flight (before Week 1)

- [ ] Create Supabase project (free tier)
- [ ] Create Supabase Storage bucket: `recipe-images` (private, signed URL access)
- [ ] Add Storage RLS policies: users can read/write only `recipe-images/{auth.uid()}/...`
- [ ] Get Anthropic API key
- [ ] Get OpenAI API key
- [ ] Reserve domain (cookshelf.app or fallback)
- [ ] Init repo, push to GitHub
- [ ] Set up `.env.example` with: `DATABASE_URL` (pooler), `DIRECT_URL` (direct, for migrations), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`

## Week 1 — Foundation

*Goal: log in, manually type a recipe, see it in the list.*

- [ ] Next.js 14 scaffold (App Router, TypeScript strict)
- [ ] Tailwind + shadcn/ui installed and themed
- [ ] Prisma init + connect to Supabase Postgres (`DATABASE_URL` = pooler, `DIRECT_URL` = direct)
- [ ] Supabase Auth wired (Google + email magic link)
- [ ] `lib/supabase/server.ts` + `lib/supabase/browser.ts` clients
- [ ] Auth middleware that gates the `(app)` route group
- [ ] `lib/auth/requireUser.ts` helper (returns User or throws 401)
- [ ] Migrate v1 schema (`User.id` uuid, `Recipe.originalImagePath`, nullable `quantity`, etc.)
- [ ] Postgres trigger: `auth.users` insert → `User` row insert
- [ ] RLS enabled + safety-net policies on every user-scoped table (Recipe, RecipeIngredient, Nutrition, DishStory, etc.) — even though Prisma bypasses them
- [ ] Scoped query helpers in `lib/db/recipes.ts` (always `userId: user.id` in `where`)
- [ ] Recipe CRUD route handlers (`app/api/recipes/`) — every handler starts with `requireUser()`
- [ ] Recipe list page (`/`)
- [ ] Recipe detail page (`/recipes/[id]`)
- [ ] Manual create form (`/recipes/new`)
- [ ] Edit form (`/recipes/[id]/edit`)
- [ ] Milestone hit ✅

## Week 2 — AI ingestion

*Goal: photo of a handwritten recipe → structured row in the database.*

- [ ] Supabase Storage helpers (`lib/supabase/storage.ts`) — signed upload URL, `signedUrlFor(path)` for reads
- [ ] `app/api/uploads/` — issues signed upload URLs scoped to `recipe-images/{userId}/...`
- [ ] Client-side upload component (drag-drop or file picker, uploads directly to Supabase Storage)
- [ ] `app/api/extract/` — accepts an object key, mints a signed read URL, calls Claude Vision with a structured-output schema
- [ ] Extraction schema: `quantity` is **nullable** (parser only fills it when confident); `quantityText` carries fuzzy quantities ("pinch", "to taste"); `rawText` always present
- [ ] "Review extracted recipe" UI (editable form pre-filled with extraction)
- [ ] On save, persist `originalImagePath` (object key, not URL)
- [ ] Tag autocomplete from existing tags
- [ ] Ingredient name normalization (case-insensitive lookup → canonical row)
- [ ] Paste-text fallback path
- [ ] Milestone hit ✅

## Week 3 — Search, scaling, nutrition, units

*Goal: search works, ×2 works, weight display works.*

- [ ] Postgres `tsvector` column on Recipe (title + instructions + flattened ingredients)
- [ ] FTS query builder in `lib/search/`
- [ ] Filter UI: diet, cuisine, course, time, calorie range
- [ ] Combine free-text query with structured filters
- [ ] Servings scaler (-/+ buttons, ×2, ×0.5 quick actions). Lines with `quantity = null` (pinch / to taste) display verbatim and don't scale.
- [ ] Seed top ~100 ingredient densities (`prisma/seed.ts`)
- [ ] OpenAI fallback for unknown ingredient densities (`lib/ai/lookupIngredientDensity.ts`)
- [ ] `lib/units/toGrams.ts` conversion function + tests (must handle `quantity = null`)
- [ ] User unit preference (`UnitSystem` — IMPERIAL / METRIC / MIXED)
- [ ] Display toggle on recipe detail page
- [ ] `POST /api/recipes/:id/nutrition` — synchronous OpenAI call (`lib/ai/estimateNutrition.ts`)
- [ ] Client orchestration: after `POST /api/recipes` returns, fire the nutrition endpoint in parallel with Dish Story
- [ ] Skeleton/loading state on the nutrition panel until the call resolves
- [ ] Lazy retrigger via `useEffect` if Nutrition is still null on detail-page load
- [ ] Regenerate-nutrition button (hits the same endpoint)
- [ ] Milestone hit ✅

## Week 4 — Dish Story + polish + ship

*Goal: real product, real users.*

- [ ] `POST /api/recipes/:id/dish-story` — synchronous OpenAI call (`lib/ai/generateDishStory.ts`)
- [ ] Client fires it after save in parallel with the nutrition endpoint
- [ ] Skeleton/loading state on the Dish Story panel until the call resolves
- [ ] Lazy retrigger via `useEffect` if DishStory is still null on detail-page load
- [ ] Regenerate Dish Story button (same endpoint)
- [ ] Source/provenance UI (SourceType picker + free-text family notes)
- [ ] Empty states (no recipes yet, no search results)
- [ ] Error states (extract failed, save failed, AI timeout)
- [ ] Loading states / skeletons
- [ ] Mobile responsiveness pass
- [ ] Deploy to Vercel (Supabase already lives in the cloud)
- [ ] Hand the URL to mom
- [ ] Milestone hit ✅

## Backlog (unsorted, future milestones)

- [ ] Substitution suggestions
- [ ] Pantry tracker
- [ ] Print-friendly recipe view
- [ ] Export recipe as PDF
- [ ] Public share links (single recipe)
- [ ] Multi-user households
- [ ] USDA FoodData Central integration (nutrition + density)
- [ ] pgvector semantic search
- [ ] Meal planning calendar
- [ ] Shopping list generation
- [ ] Recipe versioning (track adaptations over time)
- [ ] iOS app
- [ ] Voice input
- [ ] "Cook with me" hands-free mode
- [ ] Cooking timer integration
- [ ] Bulk image import
- [ ] Per-recipe cooking journal / notes
- [ ] Saved searches
- [ ] Cost estimation per recipe
- [ ] Wine/drink pairings

## Done

*Move completed milestones here with date shipped.*
