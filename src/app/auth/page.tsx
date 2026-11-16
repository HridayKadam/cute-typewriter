"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TypewriterIllustration } from "@/components/TypewriterIllustration";
import { FloralDecor } from "@/components/FloralDecor";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/auth/${mode === "signup" ? "signup" : "signin"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <FloralDecor className="absolute right-8 top-16" />
      <FloralDecor className="absolute bottom-16 left-8 rotate-180" />
      <TypewriterIllustration className="mb-6 w-64" />
      <h1 className="font-script text-4xl text-vintage-brown">dear diary ♡</h1>
      <p className="mt-2 max-w-md text-center font-serif text-vintage-muted">
        your private corner of the internet — only you can read what lives here.
      </p>

      <form onSubmit={submit} className="card-cozy mt-8 w-full max-w-md space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-full py-2 font-serif text-sm ${mode === "signin" ? "bg-blush-200" : "bg-white/50"}`}
            onClick={() => setMode("signin")}
          >
            sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full py-2 font-serif text-sm ${mode === "signup" ? "bg-blush-200" : "bg-white/50"}`}
            onClick={() => setMode("signup")}
          >
            create account
          </button>
        </div>
        {mode === "signup" && (
          <input
            placeholder="nickname (lovely)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-script text-xl outline-none focus:border-blush-300"
          />
        )}
        <input
          type="email"
          required
          placeholder="your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none focus:border-blush-300"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-vintage-brown/15 bg-ivory p-3 font-serif outline-none focus:border-blush-300"
        />
        {error && <p className="text-center text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-vintage w-full">
          {loading ? "one moment…" : mode === "signup" ? "begin your diary ♡" : "welcome back ♡"}
        </button>
      </form>
    </div>
  );
}