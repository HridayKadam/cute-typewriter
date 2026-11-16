"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { SaveToast } from "@/components/SaveToast";
import { getProfile, updateProfile } from "@/lib/storage";
import { notifyProfileChange } from "@/components/ClientShell";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const update = (patch: Partial<Profile>) => {
    const next = updateProfile(patch);
    setProfile(next);
    notifyProfileChange();
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
  };

  if (!profile) return <p className="font-serif text-vintage-muted">loading your preferences…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-script text-4xl text-vintage-brown">personalize your desk</h1>
      <p className="font-serif text-sm text-vintage-muted">
        everything saves quietly in your browser — no account needed. just you and your diary ♡
      </p>

      <div className="card-cozy space-y-4">
        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">nickname</span>
          <input
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-script text-2xl outline-none"
            value={profile.nickname}
            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
            onBlur={() => update({ nickname: profile.nickname })}
          />
        </label>

        <label className="block">
          <span className="font-serif text-sm text-vintage-muted">paper style</span>
          <select
            className="mt-1 w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none"
            value={profile.paper_style}
            onChange={(e) => update({ paper_style: e.target.value })}
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
            onChange={(e) => update({ typewriter_font: e.target.value })}
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
            onChange={(e) => update({ theme: e.target.value })}
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
            onChange={(e) => update({ background_style: e.target.value })}
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
            onChange={(e) => update({ ambient_sound: e.target.value })}
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
            onChange={(e) => update({ typewriter_sounds: e.target.checked })}
          />
          <span className="font-serif">typewriter key sounds</span>
        </label>
      </div>
      <SaveToast show={toast} />
    </div>
  );
}