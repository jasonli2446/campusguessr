import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import UploadForm from "./upload-form";

export default async function UploadPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Campus Image</h1>
          <p className="text-muted-foreground">Upload a 360° campus image and tag its location</p>
        </div>

        <UploadForm userId={data.user.id} />
      </main>
    </div>
  );
}
