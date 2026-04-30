export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-600">
          CookShelf
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-stone-950">
            Preserve the recipes worth remembering.
          </h1>
          <p className="text-lg leading-8 text-stone-700">
            CookShelf is getting its foundation: a Next.js app router,
            TypeScript, Tailwind, and the tooling we need to build the recipe
            archive cleanly.
          </p>
        </div>
      </section>
    </main>
  );
}
