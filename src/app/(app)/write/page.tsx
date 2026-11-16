"use client";

import { Suspense, useEffect, useState } from "react";
import { TypewriterEditor } from "@/components/TypewriterEditor";
import { getProfile } from "@/lib/storage";
import type { Profile } from "@/lib/types";

function WriteInner() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => setProfile(getProfile()), []);
  if (!profile) return <p className="text-center font-serif">loading your paper…</p>;
  return <TypewriterEditor profile={profile} />;
}

export default function WritePage() {
  return (
    <div>
      <h1 className="mb-6 text-center font-script text-4xl text-vintage-brown">the typewriter desk</h1>
      <Suspense fallback={<p className="text-center font-serif">loading your paper…</p>}>
        <WriteInner />
      </Suspense>
    </div>
  );
}