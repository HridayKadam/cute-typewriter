import { MomentsGallery } from "@/components/MomentsGallery";

export default function MomentsPage() {
  return (
    <div>
      <h1 className="mb-2 font-script text-4xl text-vintage-brown">little moments</h1>
      <p className="mb-8 font-serif text-vintage-muted">photographs, memories, and captured softness</p>
      <MomentsGallery />
    </div>
  );
}