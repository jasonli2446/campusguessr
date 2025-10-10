import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, latitude, longitude, username } = body;

    // Validate required fields
    if (!image || latitude === undefined || longitude === undefined || !username) {
      return NextResponse.json(
        { error: "Missing required fields: image, latitude, longitude, username" },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof image !== "string") {
      return NextResponse.json(
        { error: "image must be a string" },
        { status: 400 }
      );
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "latitude and longitude must be numbers" },
        { status: 400 }
      );
    }

    if (typeof username !== "string") {
      return NextResponse.json(
        { error: "username must be a string" },
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

    // Decode the base64 image
    // Remove the data:image/...;base64, prefix if present
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Security: Check file size (limit to 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Extract file extension from base64 string (if present)
    let fileExtension = 'jpg'; // default
    if (image.startsWith('data:image/')) {
      const mimeType = image.substring(11, image.indexOf(';'));
      fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType;
    }

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
        latitude,
        longitude,
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
          latitude,
          longitude,
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

