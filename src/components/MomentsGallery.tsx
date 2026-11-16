"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { SaveToast } from "@/components/SaveToast";
import type { Memory } from "@/lib/types";

export function MomentsGallery() {
  const [items, setItems] = useState<Memory[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/memories");
    setItems(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, caption, photo_url: photoData }),
    });
    setTitle("");
    setCaption("");
    setPhotoData(null);
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
    void load();
  };

  return (
    <div className="space-y-8">
      <div className="card-cozy space-y-3">
        <h2 className="font-script text-3xl text-vintage-brown">capture a little moment</h2>
        <input
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-vintage-brown/15 bg-ivory/80 p-3 font-serif outline-none"
        />
        <textarea
          placeholder="what made this moment special?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded-xl border border-vintage-brown/15 bg-ivory/80 p-3 font-typewriter outline-none"
          rows={3}
        />
        <label className="btn-vintage cursor-pointer">
          add photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        {photoData && (
          <div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-xl">
            <Image src={photoData} alt="preview" fill className="object-cover" unoptimized />
          </div>
        )}
        <button type="button" className="btn-vintage" onClick={() => void save()}>
          save memory ♡
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center font-script text-2xl text-vintage-muted">
          your photo memories will live here — start collecting little joys ♡
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <article key={m.id} className="card-cozy group overflow-hidden p-0">
              {m.photo_url && (
                <div className="relative h-44 w-full">
                  <Image src={m.photo_url} alt={m.title} fill className="object-cover transition group-hover:scale-105" unoptimized />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-serif text-lg text-vintage-ink">{m.title || "untitled moment"}</h3>
                <p className="mt-1 font-typewriter text-sm text-vintage-muted">{m.caption}</p>
                <button
                  type="button"
                  className="mt-3 text-sm text-red-800/60 hover:underline"
                  onClick={async () => {
                    await fetch(`/api/memories?id=${m.id}`, { method: "DELETE" });
                    void load();
                  }}
                >
                  remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <SaveToast show={toast} />
    </div>
  );
}