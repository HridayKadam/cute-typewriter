"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { SaveToast } from "@/components/SaveToast";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/profile");
      setProfile(await res.json());
    })();
  }, []);

  const update = async (patch: Partial<Profile>) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setProfile(await res.json());
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
  };

  if (!profile) return <p className="font-serif text-vintage-muted">loading your preferences…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-script text-4xl text-vintage-brown">personalize your desk</h1>

      <div className="card-cozy space-y-4">
        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">nickname</span>
          <input
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-script text-2xl outline-none"
            value={profile.nickname}
            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
            onBlur={() => void update({ nickname: profile.nickname })}
          />
        </label>

        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">paper style</span>
          <select
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none"
            value={profile.paper_style}
            onChange={(e) => void update({ paper_style: e.target.value })}
          >
            <option value="cream">cream</option>
            <option value="rose">blush rose</option>
            <option value="parchment">parchment</option>
          </select>
        </label>

        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">typewriter font</span>
          <select
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none"
            value={profile.typewriter_font}
            onChange={(e) => void update({ typewriter_font: e.target.value })}
          >
            <option value="special-elite">vintage elite</option>
            <option value="courier">classic courier</option>
            <option value="serif">soft serif</option>
          </select>
        </label>

        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">theme</span>
          <select
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none"
            value={profile.theme}
            onChange={(e) => void update({ theme: e.target.value })}
          >
            <option value="warm">warm cream</option>
            <option value="light">soft light</option>
          </select>
        </label>

        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">background</span>
          <select
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none"
            value={profile.background_style}
            onChange={(e) => void update({ background_style: e.target.value })}
          >
            <option value="floral">floral whispers</option>
            <option value="minimal">quiet minimal</option>
            <option value="stars">little stars</option>
          </select>
        </label>

        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">ambient sound</span>
          <select
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none"
            value={profile.ambient_sound ?? "none"}
            onChange={(e) => void update({ ambient_sound: e.target.value })}
          >
            <option value="none">off</option>
            <option value="rain">gentle rain</option>
            <option value="fireplace">fireplace</option>
            <option value="cafe">café hum</option>
          </select>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={profile.typewriter_sounds}
            onChange={(e) => void update({ typewriter_sounds: e.target.checked })}
          />
          <span className="font-serif">typewriter key sounds</span>
        </label>
      </div>

      <p className="font-typewriter text-sm text-vintage-muted">
        using supabase? add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect auth, database, and photo storage.
      </p>
      <SaveToast show={toast} />
    </div>
  );
}