"use client";

import { CollectionEditor } from "@/components/CollectionEditor";

export default function LettersPage() {
  return (
    <div>
      <h1 className="mb-2 font-script text-4xl text-vintage-brown">letters to myself</h1>
      <p className="mb-8 font-serif text-vintage-muted">words for the you who&apos;s still becoming</p>
      <CollectionEditor
        apiPath="/api/letters"
        emptyCta="write your first letter to future-you ♡"
        fields={[
          { key: "title", label: "letter title" },
          { key: "deliver_on", label: "open on (optional, YYYY-MM-DD)", type: "date" },
          { key: "body", label: "dear future me…", multiline: true },
        ]}
        renderItem={(item, onEdit, onDelete) => (
          <article key={String(item.id)} className="card-cozy">
            <h3 className="font-serif text-lg">{String(item.title)}</h3>
            {item.deliver_on ? (
              <p className="text-xs text-vintage-muted">open on {String(item.deliver_on)}</p>
            ) : null}
            <p className="mt-2 line-clamp-4 font-typewriter text-sm">{String(item.body)}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <button type="button" onClick={onEdit} className="text-vintage-brown hover:underline">
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