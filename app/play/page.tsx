import PhotoSphereViewer from "@/components/gameplay/photo-sphere-viewer";

export default function PlayPage() {
  const supabaseImageUrl = "https://wwewcdgukzswaejezywc.supabase.co/storage/v1/object/public/images/test_panorama.jpg";

  return (
    <div className="w-full h-screen">
      <PhotoSphereViewer 
        imageUrl={supabaseImageUrl}
        height="100vh"
        width="100%"
        className="w-full h-screen"
      />
    </div>
  );
}
