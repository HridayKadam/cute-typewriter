import { AppNav } from "@/components/AppNav";
import { AmbientSound } from "@/components/AmbientSound";
import { getProfile } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let ambient: string | null = "none";
  try {
    const profile = await getProfile();
    ambient = profile?.ambient_sound ?? "none";
  } catch {
    /* not signed in */
  }

  return (
    <>
      <AmbientSound sound={ambient} />
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