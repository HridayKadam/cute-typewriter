"use client";

import { useCallback, useEffect, useState } from "react";
import type { DreamWish } from "@/lib/types";
import { SaveToast } from "@/components/SaveToast";

export default function DreamsPage() {
  const [items, setItems] = useState<DreamWish[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/dreams");
    setItems(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    await fetch("/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setTitle("");
    setDescription("");
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
    void load();
  };

  const toggle = async (item: DreamWish) => {
    await fetch("/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, title: item.title, description: item.description, is_completed: !item.is_completed }),
    });
    void load();
  };

  return (
    <div>
      <h1 className="mb-2 font-script text-4xl text-vintage-brown">dreams & wishes</h1>
      <p className="mb-8 font-serif text-vintage-muted">your gentle bucket list of experiences to cherish</p>

      <div className="card-cozy mb-8 space-y-3">
        <input
          placeholder="a wish"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-vintage-brown/15 bg-ivory/80 p-3 font-serif outline-none"
        />
        <textarea
          placeholder="why it matters to you"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-vintage-brown/15 bg-ivory/80 p-3 font-typewriter outline-none"
          rows={3}
        />
        <button type="button" className="btn-vintage" onClick={() => void save()}>
          add wish ♡
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="card-cozy flex items-start gap-3">
            <button
              type="button"
              onClick={() => void toggle(item)}
              className={`mt-1 h-5 w-5 shrink-0 rounded border ${item.is_completed ? "border-blush-400 bg-blush-300" : "border-vintage-brown/30"}`}
              aria-label="toggle completed"
            />
            <div className={item.is_completed ? "opacity-60 line-through" : ""}>
              <h3 className="font-serif text-lg">{item.title}</h3>
              <p className="font-typewriter text-sm text-vintage-muted">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="text-center font-script text-2xl text-vintage-muted">plant your first dream here ✨</p>
      )}
      <SaveToast show={toast} />
    </div>
  );
}