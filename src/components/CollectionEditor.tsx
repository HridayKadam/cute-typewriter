"use client";

import { useCallback, useEffect, useState } from "react";
import { SaveToast } from "@/components/SaveToast";
import {
  deleteCollectionItem,
  listCollection,
  saveCollectionItem,
  type CollectionKey,
} from "@/lib/storage";

type Field = {
  key: string;
  label: string;
  multiline?: boolean;
  type?: string;
};

type Props = {
  collection: CollectionKey;
  fields: Field[];
  emptyCta: string;
  renderItem: (item: Record<string, unknown>, onEdit: () => void, onDelete: () => void) => React.ReactNode;
};

export function CollectionEditor({ collection, fields, emptyCta, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const load = useCallback(() => setItems(listCollection(collection)), [collection]);

  useEffect(() => {
    load();
  }, [load]);

  const save = () => {
    const payload: Record<string, unknown> = { ...form };
    if (editId) payload.id = editId;
    saveCollectionItem(collection, payload);
    load();
    setForm({});
    setEditId(null);
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
  };

  const remove = (id: string) => {
    deleteCollectionItem(collection, id);
    load();
  };

  return (
    <div className="space-y-8">
      <div className="card-cozy space-y-3">
        <h2 className="font-script text-3xl text-vintage-brown">add something new</h2>
        {fields.map((f) =>
          f.multiline ? (
            <textarea
              key={f.key}
              placeholder={f.label}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="w-full rounded-xl border border-vintage-brown/15 bg-ivory/80 p-3 font-typewriter outline-none focus:border-blush-300"
              rows={4}
            />
          ) : (
            <input
              key={f.key}
              type={f.type ?? "text"}
              placeholder={f.label}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="w-full rounded-xl border border-vintage-brown/15 bg-ivory/80 p-3 font-serif outline-none focus:border-blush-300"
            />
          ),
        )}
        <button type="button" className="btn-vintage" onClick={save}>
          {editId ? "update" : "save"} ♡
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center font-script text-2xl text-vintage-muted">{emptyCta}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) =>
            renderItem(
              item,
              () => {
                setEditId(String(item.id));
                const next: Record<string, string> = {};
                for (const f of fields) next[f.key] = String(item[f.key] ?? "");
                setForm(next);
              },
              () => remove(String(item.id)),
            ),
          )}
        </div>
      )}
      <SaveToast show={toast} />
    </div>
  );
}