import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse FormData instead of JSON
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");
    const username = formData.get("username");

    // Validate required fields
    if (!file || latitude === null || longitude === null || !username) {
      return NextResponse.json(
        { error: "Missing required fields: file, latitude, longitude, username" },
        { status: 400 }
      );
    }

    // Validate data types
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file must be a File object" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "latitude and longitude must be valid numbers" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - user must be logged in" },
        { status: 401 }
      );
    }

    // Verify the username matches the authenticated user
    if (user.id !== username) {
      return NextResponse.json(
        { error: "Unauthorized - username does not match authenticated user" },
        { status: 403 }
      );
    }

    // Security: Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Extract file extension from filename or mime type
    let fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
      fileExtension = file.type.split('/')[1] || 'jpg';
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Generate secure filename (remove username to avoid exposure)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `upload_${timestamp}_${randomString}.${fileExtension}`;

    // Create service client for storage operations (bypasses RLS)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upload to Supabase Storage using service role
    const { error: uploadError } = await serviceSupabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: `image/${fileExtension}`,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image", details: uploadError.message },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('images')
      .getPublicUrl(fileName);

    // Insert location data into database using service client (bypasses RLS)
    const { data: locationData, error: dbError } = await serviceSupabase
      .from('locations')
      .insert({
        image_url: publicUrl,
        latitude: lat,
        longitude: lng,
        created_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insertion error:", dbError);
      return NextResponse.json(
        { error: "Failed to save location data", details: dbError.message },
        { status: 500 }
      );
    }

    // Return success response with image URL and location data
    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded and location saved successfully",
        data: {
          imageUrl: publicUrl,
          fileName: fileName,
          latitude: lat,
          longitude: lng,
          username,
          locationId: locationData.id
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in upload-image endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

