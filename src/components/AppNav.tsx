"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "home" },
  { href: "/write", label: "write" },
  { href: "/journal", label: "my journal" },
  { href: "/moments", label: "little moments" },
  { href: "/letters", label: "letters to myself" },
  { href: "/loves", label: "things i love" },
  { href: "/dreams", label: "dreams & wishes" },
  { href: "/favorites", label: "my favorites" },
  { href: "/mood", label: "mood" },
  { href: "/settings", label: "settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-vintage-brown/10 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="font-script text-2xl text-vintage-brown md:text-3xl">
          dear diary <span className="text-blush-500">♡</span>
        </Link>
        <nav className="flex max-w-full flex-wrap gap-x-4 gap-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "nav-link capitalize",
                pathname === l.href && "font-medium text-vintage-ink underline decoration-blush-300 decoration-2 underline-offset-4",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="text-sm font-serif text-vintage-muted hover:text-vintage-ink"
          onClick={async () => {
            await fetch("/api/auth/signout", { method: "POST" });
            router.push("/auth");
            router.refresh();
          }}
        >
          sign out
        </button>
      </div>
    </header>
  );
}