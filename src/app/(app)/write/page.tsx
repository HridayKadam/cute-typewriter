import { Suspense } from "react";
import { TypewriterEditor } from "@/components/TypewriterEditor";
import { getProfile } from "@/lib/data";

export default async function WritePage() {
  const profile = await getProfile();
  return (
    <div>
      <h1 className="mb-6 text-center font-script text-4xl text-vintage-brown">the typewriter desk</h1>
      <Suspense fallback={<p className="text-center font-serif">loading your paper…</p>}>
        <TypewriterEditor profile={profile} />
      </Suspense>
    </div>
  );
}