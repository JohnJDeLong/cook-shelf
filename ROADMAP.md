# Roadmap

This file tracks where CookShelf is going beyond v1. The active task list is in [TODO.md](./TODO.md); this is the higher-altitude view, organized by release.

A roadmap is for "we know we want this eventually" items — features that aren't in the current sprint but should inform design decisions today. It's allowed to be vague: nothing here has a date attached, and items move freely between sections as priorities clarify.

## v1 — MVP (pre-development)

The 4-week build. Goal: mom is using it.

- Image-based recipe ingestion (Claude Vision)
- Mobile-first web upload flow for taking recipe photos from a phone
- Manual entry + paste-text entry
- Recipe library with cards, tags, source/provenance
- Full-text + structured search (diet, cuisine, course, calorie range)
- Servings scaling
- Volume ↔ weight conversion (seeded densities + OpenAI fallback)
- AI-estimated nutrition
- Dish Story (cultural origin, historical note, regional variations, serving traditions, fun facts)
- Single-user UX (multi-user-ready schema)

## v1.1 — Quality of life

Targeted post-v1 polish. No major architecture changes.

- Print-friendly recipe view
- Export recipe as PDF
- Better ingredient parsing (split "2½ cups all-purpose flour, sifted" cleanly into structured fields)
- Substitution suggestions ("I'm out of buttermilk, what can I use?")
- Per-recipe notes / cooking journal ("doubled the salt, was perfect")
- Bulk import — multiple images at once
- Search history + saved searches

## v2 — Smarter search and pantry

The first real feature push.

- pgvector semantic search ("comforting weeknight dinners")
- Pantry tracker — log what's in the kitchen, surface recipes that use it
- USDA FoodData Central integration for higher-accuracy nutrition + density
- Shopping list generation from selected recipes
- Recipe collections / cookbooks (curated subsets)

## v3 — Sharing and meal planning

Multi-user features, when there's demand.

- Public recipe links
- Shared family cookbooks (multi-user, role-based)
- Meal planning calendar
- Weekly meal plan → shopping list

## v4 — Native mobile and ambient

Native mobile becomes worthwhile if the v1 mobile web upload flow feels clunky in real kitchen use.

- iOS app (React Native or native)
- "Cook with me" mode — step-by-step with timers and hands-free advance
- Voice input ("hey CookShelf, double the banana bread")
- Apple Watch / Wear OS timer integration

## Speculative / parking lot

Ideas that are interesting but not committed:

- Recipe versioning (track how grandma's recipe was adapted over generations)
- Diet-specific generated variants (vegan version of grandma's lasagna)
- Cost estimation per recipe (groceries integration)
- Wine/drink pairings
- Community sharing — opt-in public cookbooks
- Image generation for recipes that don't have a photo

---

## How to update this file

When something on the active TODO ships, move it to the matching version section so this file stays in sync with reality. When new ideas surface in conversation, drop them in **Speculative** and promote them when you're ready to commit. Don't be precious — items can move backward too if v2 is taking too long.
