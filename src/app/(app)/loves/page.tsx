"use client";

import { CollectionEditor } from "@/components/CollectionEditor";

const categories = ["quote", "song", "book", "thought"];

export default function LovesPage() {
  return (
    <div>
      <h1 className="mb-2 font-script text-4xl text-vintage-brown">things i love</h1>
      <p className="mb-8 font-serif text-vintage-muted">favorite quotes, songs, books, and wandering thoughts</p>
      <CollectionEditor
        collection="things"
        emptyCta="collect the little things that make your heart full ♡"
        fields={[
          { key: "category", label: `category (${categories.join(", ")})` },
          { key: "title", label: "title" },
          { key: "content", label: "why you love it…", multiline: true },
        ]}
        renderItem={(item, onEdit, onDelete) => (
          <article key={String(item.id)} className="card-cozy">
            <span className="rounded-full bg-blush-100 px-2 py-0.5 font-serif text-xs uppercase tracking-wide text-vintage-muted">
              {String(item.category)}
            </span>
            <h3 className="mt-2 font-serif text-lg">{String(item.title)}</h3>
            <p className="mt-1 font-typewriter text-sm text-vintage-muted">{String(item.content)}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <button type="button" onClick={onEdit} className="hover:underline">
                edit
              </button>
              <button type="button" onClick={onDelete} className="text-red-800/60 hover:underline">
                delete
              </button>
            </div>
          </article>
        )}
      />
    </div>
  );
}