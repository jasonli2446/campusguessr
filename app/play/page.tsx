import PhotoSphereViewer from "@/components/gameplay/photo-sphere-viewer";
import CampusMap from "@/components/gameplay/CampusMap";

export default function PlayPage() {
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
