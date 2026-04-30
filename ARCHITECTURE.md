# Architecture

System design and rationale for CookShelf v1. The full design doc with wireframes lives in [DESIGN.md](./DESIGN.md); this file is the lean technical reference.

## High-level

CookShelf is a single Next.js app deployed on Vercel, talking to **Supabase** (which provides Postgres, auth, and object storage in one provider), **Anthropic** for image-based recipe extraction, and **OpenAI** for the other structured AI tasks.

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
┌──────▼───────────────────────────────┐
│   Next.js (Vercel)                   │
│   - React Server Components          │
│   - Route handlers (app/api/*)       │
└──────────────┬───────────────┬───────┘
               │               │
               ▼               ▼
       ┌───────────────┐ ┌───────────────┐
       │   Supabase    │ │ AI providers  │
       │  ─────────    │ │  ─────────    │
       │  Postgres     │ │ Claude Vision │
       │  Auth         │ │ OpenAI        │
       │  Storage      │ └───────────────┘
       └───────────────┘
```

Four providers total: Supabase, Anthropic, OpenAI, Vercel. Plus your domain registrar.

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Frontend + backend | Next.js 14 (App Router) | One framework, route handlers for API; can split later |
| Database | Supabase Postgres | Mature Postgres, free tier, pgvector available later |
| ORM | Prisma | Type-safe schema, migrations, fits existing skill set |
| Auth | Supabase Auth | Postgres-native (RLS ties to `auth.uid()`); consolidated with DB |
| File storage | Supabase Storage | S3-compatible, signed URLs, lives next to the data |
| Recipe extraction AI | Anthropic Claude Vision | Image understanding replaces an OCR pipeline |
| Structured text/data AI | OpenAI | Structured outputs for nutrition, Dish Story, and density lookup |
| Hosting | Vercel | Seamless Next.js deploys, free tier sufficient for v1 |
| Search (v1) | Postgres `tsvector` | Sufficient for "italian vegetarian under 600 cal" |
| Search (v2) | pgvector | Semantic search over recipes |
| Nutrition (v1) | OpenAI estimate | Fast, structured, accurate enough |
| Nutrition (v2) | USDA FoodData Central | Authoritative, but adds an API dep |

### Why Supabase (consolidated stack)

Originally we'd planned three providers — Neon for DB, Clerk for auth, Cloudflare R2 for storage. Switched to Supabase for v1 because:

- **One provider, one bill, one dashboard, one set of credentials.** Less wiring on day 1.
- **Row-level security (RLS)** ties authorization directly to `auth.uid()` in Postgres. When v3 adds shared family cookbooks, this becomes a huge advantage over juggling Clerk user IDs against your own DB.
- **Storage lives next to the database.** Recipe images and recipe rows are colocated; signed URLs are issued by the same auth context.

Tradeoff accepted: Supabase pauses free-tier projects after ~1 week of inactivity. One-click resume from the dashboard. Upgrade to the $25/mo Pro tier whenever inactivity becomes a real problem.

## Data model

`prisma/schema.prisma` is the source of truth. Key entities:

- **User** — `id` is a `uuid` that mirrors `auth.users.id`. Created automatically by a Postgres trigger on `auth.users` insert. Holds display preferences (`unitSystem`).
- **Recipe** — title, instructions, servings, source/provenance fields, `originalImagePath` (storage key, not URL), links to ingredients/tags/nutrition/dishStory. `userId` is a uuid FK to `User.id`.
- **Ingredient** — canonical record (one row per "all-purpose flour" globally), holds density data (`gramsPerCup`, `gramsPerTbsp`, `avgWeightG`, `densitySource`)
- **RecipeIngredient** — join row. `quantity` is **nullable** (real recipes have "pinch", "to taste"), `quantityText` carries non-numeric quantities, `unit` may be empty, `rawText` is always the source of truth for display, `quantityG` is the computed canonical weight (only when scalable).
- **Tag** — typed by `TagCategory` (DIET, CUISINE, COURSE, TECHNIQUE, OCCASION)
- **Nutrition** — per-serving macros, sourced from `AI_ESTIMATE` for v1
- **DishStory** — culturalOrigin, historicalNote, regionalVariations, servingTraditions, funFacts

Full schema and rationale in [DESIGN.md §2](./DESIGN.md).

### Authorization

**Important:** we deliberately do *not* rely on RLS as the primary guard for app code, because the chosen DB layer (Prisma) bypasses it. Be explicit about which layer is doing the work.

The pattern:

1. **App layer (the real guard).** Every server action and route handler starts with `requireUser()`. Every query goes through a scoped helper in `lib/db/<resource>.ts` that always includes `userId: user.id` in the `where` clause. Direct `prisma.recipe.findMany()` from a route handler is forbidden.
2. **RLS on DB tables (safety-net + documentation).** Enabled with policies on every user-scoped table, but it does not fire under Prisma queries (which run as the postgres role). The policies exist so that any future code path that *does* honor RLS — Supabase JS client, Studio, ad-hoc SQL — gets blocked from reading other users' rows by default.
3. **RLS on Storage (the real guard for files).** Storage operations go through the Supabase JS client with the user's JWT, so RLS *does* fire here. Bucket policies on `recipe-images` are the only thing keeping users out of each other's folders. Get them right.

```sql
-- DB safety-net policy (does NOT fire for Prisma; documents intent and
-- protects any non-Prisma access path)
alter table "Recipe" enable row level security;

create policy "Recipe owner only" on "Recipe"
  using (auth.uid() = "userId")
  with check (auth.uid() = "userId");

-- Storage policy (DOES fire — this is the real guard for image access)
create policy "Users read own recipe images"
  on storage.objects for select
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- ...similar for insert / update / delete on the bucket
```

If we ever want Prisma to honor RLS, the upgrade path is to switch the DB connection to the `authenticated` role and set the JWT per transaction. v2 conversation.

## File layout

```
app/
  (app)/                # auth-gated app pages
    page.tsx            # recipe library
    recipes/
      new/page.tsx      # add recipe (upload/paste/manual)
      [id]/page.tsx     # recipe detail
      [id]/edit/page.tsx
    settings/page.tsx   # unit system, account
  (marketing)/
    page.tsx            # public landing
  api/                  # route handlers
    recipes/
    extract/            # Claude Vision recipe extraction
    uploads/            # Supabase Storage signed-URL issuer
components/
  ui/                   # shadcn primitives
  recipe/               # recipe-specific components
lib/
  db.ts                 # Prisma singleton
  db/
    recipes.ts          # scoped query helpers (always include userId in where)
    ingredients.ts
  auth/
    requireUser.ts      # server-side helper: returns User or 401
  supabase/
    server.ts           # server-side Supabase client (auth + storage)
    browser.ts          # browser-side Supabase client
    storage.ts          # signed URL helpers for the recipe-images bucket
  ai/
    extractRecipe.ts
    estimateNutrition.ts
    generateDishStory.ts
    lookupIngredientDensity.ts
  units/
    toGrams.ts          # the conversion function
    toCups.ts
  search/
    queryBuilder.ts
prisma/
  schema.prisma
  migrations/
  seed.ts               # ingredient density seed
```

## Key flows

### Recipe ingestion (the magic flow)

1. User picks an image in the browser → client requests a signed upload URL from `POST /api/uploads`
2. Server returns a Supabase Storage signed upload URL scoped to `recipe-images/{userId}/...`
3. Client uploads the file directly to Supabase Storage
4. Client calls `POST /api/extract` with the storage object key (path)
5. Server mints a short-lived signed *read* URL, downloads the image, calls Claude Vision with a structured-output schema
6. Server returns parsed recipe JSON to the client (not yet saved)
7. User reviews and edits in the UI, then `POST /api/recipes` persists. The recipe row stores `originalImagePath` (the object key), never a URL.

Two-step (extract → review → save) instead of auto-save: parsing isn't perfect and the cost of a wrong saved recipe is higher than one confirmation step.

### Servings scaling + unit toggle

Pure client-side math. `RecipeIngredient.quantityG` (when present) is the canonical scaling source — multiplying grams is exact. Falls back to `quantity` × `unit` when weight wasn't computable. Lines with `quantity = null` (pinch, to taste, juice of 1 lemon) display verbatim from `rawText` and are not scaled. `User.unitSystem` controls display.

### Nutrition estimation

**Synchronous endpoint, client-orchestrated.** After `POST /api/recipes` returns, the client fires `POST /api/recipes/:id/nutrition` in parallel with the Dish Story call. The endpoint calls OpenAI with the structured ingredient list, writes the result, and returns. The recipe detail page renders a skeleton until the call resolves; if the user navigates back later and `Nutrition` is still null, a `useEffect` lazily triggers the same endpoint. Regenerate button hits the same endpoint. Stored with `source = AI_ESTIMATE`.

### Dish Story generation

Same pattern as nutrition — `POST /api/recipes/:id/dish-story`, synchronous OpenAI call, fired by the client right after save in parallel with the nutrition call. Five fields (`culturalOrigin`, `historicalNote`, `regionalVariations`, `servingTraditions`, `funFacts`); the model fills whichever it has confidence in.

No background job system in v1. If we ever outgrow synchronous handlers, the v1.1 swap is to put QStash or Inngest behind the same endpoints.

### Volume → weight conversion

- `Ingredient.gramsPerCup` / `gramsPerTbsp` / `avgWeightG` carry the density data
- Top ~100 ingredients seeded at deploy via `prisma/seed.ts`
- Unknown ingredients trigger a one-time OpenAI lookup, cached on the row with `densitySource = AI_ESTIMATE`
- `lib/units/toGrams.ts` is the pure conversion function (well-tested)

## Key decisions (and what we ruled out)

- **Supabase as the consolidated platform.** DB + auth + storage in one provider. Ruled out: Neon (DB only) + Clerk (auth) + Cloudflare R2 (storage). Three vendors collapsed into one.
- **App-layer authorization, not RLS, for app code.** Prisma is the only DB layer and it bypasses RLS. The real guard is `requireUser()` + scoped query helpers. RLS is enabled on tables as documentation/safety-net and on Storage as the actual file-access guard. Ruled out: routing reads through the Supabase JS client to make RLS the primary guard (more complexity, two clients, type duplication).
- **Synchronous AI endpoints, no background jobs.** Nutrition and Dish Story are normal OpenAI-backed route handlers fired in parallel by the client after save. Ruled out: a queue (Inngest/QStash), Vercel `waitUntil`, "fire and forget on save". Easier to reason about, easier to retry, no extra infra.
- **`User.id` is a uuid mirroring `auth.users.id`.** A Postgres trigger creates the row on signup. Ruled out: `cuid()` user IDs with a separate `authId` column (RLS casts get ugly, two sources of truth).
- **`RecipeIngredient.quantity` is nullable.** Real recipes have "pinch", "to taste", "juice of 1". Lines without a numeric quantity are unscalable; the UI shows `rawText` and the ×2 button skips them. Ruled out: forcing every line into a Float (causes parser failures and bad UX).
- **`originalImagePath` is a storage key, not a signed URL.** Signed URLs expire. Mint fresh ones at render time.
- **Claude Vision instead of an OCR pipeline.** A single model call replaces tesseract → cleanup → LLM structuring. Faster to build, more accurate on handwriting.
- **Provider choice stays inside `lib/ai/`.** Route handlers call task modules, not provider SDKs. Claude owns image extraction; OpenAI owns nutrition, Dish Story, and density lookup.
- **Postgres FTS instead of pgvector for v1.** Most CookShelf "search" is structured filters (tags, calorie range, time). FTS handles the free-text part well enough.
- **AI estimate for nutrition before USDA.** USDA is more accurate but adds an API dep. Estimates ship faster and are good enough.
- **Single Next.js app, no separate Express service.** Can split later.
- **No vector DB.** pgvector if/when we need it. No Pinecone/Weaviate.
- **Two-step recipe ingestion.** Friction is worth it — bad data is worse.
- **Density on `Ingredient`, not `RecipeIngredient`.** "Flour" weighs the same wherever it shows up.
- **Compute `quantityG` at write time, not read time.** Saves doing it on every page load and lets you index/search by weight.
