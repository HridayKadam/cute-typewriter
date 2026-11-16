"use client";

import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AmbientSound } from "@/components/AmbientSound";
import { getProfile } from "@/lib/storage";
import type { Profile } from "@/lib/types";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
    const onStorage = () => setProfile(getProfile());
    window.addEventListener("storage", onStorage);
    window.addEventListener("dear-diary-profile", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dear-diary-profile", onStorage);
    };
  }, []);

  return (
    <>
      <AmbientSound sound={profile?.ambient_sound ?? "none"} />
      <AppNav />
      <main className="relative mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 md:px-6">
        <div className="pointer-events-none fixed -left-8 top-32 opacity-30">
          <span className="font-script text-6xl text-blush-300">♡</span>
        </div>
        {children}
      </main>
    </>
  );
}

export function notifyProfileChange() {
  window.dispatchEvent(new Event("dear-diary-profile"));
}