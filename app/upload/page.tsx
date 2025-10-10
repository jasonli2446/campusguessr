import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadForm from "./upload-form";

export default async function UploadPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Upload Campus Image</h1>
        <p className="text-gray-600 mb-8">Upload a 360° campus image and tag its location</p>

        <UploadForm userId={data.user.id} />
      </div>
    </div>
  );
}
