import PhotoSphereViewer from "@/components/gameplay/photo-sphere-viewer";
import CampusMap from "@/components/gameplay/CampusMap";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPlayPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  const supabaseImageUrl = "https://wwewcdgukzswaejezywc.supabase.co/storage/v1/object/public/images/test_panorama.jpg";

  return (
    <div className="w-full h-screen relative">
      <PhotoSphereViewer
        imageUrl={supabaseImageUrl}
        height="100vh"
        width="100%"
        className="w-full h-screen"
      />

      {/* Campus Map in bottom right corner */}
      <div className="absolute bottom-4 right-4 w-80 h-60 z-10">
        <CampusMap className="w-full h-full" />
      </div>
    </div>
  );
}
