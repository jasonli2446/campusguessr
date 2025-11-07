import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Runtime configuration for route
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Parse JSON metadata (file is already uploaded to Supabase Storage from client)
    const body = await request.json();
    const { imageUrl, fileName, latitude, longitude, userId } = body;

    // Validate required fields
    if (!imageUrl || !fileName || latitude === undefined || longitude === undefined || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, fileName, latitude, longitude, userId" },
        { status: 400 }
      );
    }

    // Validate data types
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

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

    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - userId does not match authenticated user" },
        { status: 403 }
      );
    }

    // Verify the imageUrl is from our Supabase Storage (security check)
    const supabaseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;
    if (!imageUrl.startsWith(supabaseStorageUrl)) {
      return NextResponse.json(
        { error: "Invalid image URL - must be from Supabase Storage" },
        { status: 400 }
      );
    }

    // Create service client for database operations (bypasses RLS)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert location data into database using service client (bypasses RLS)
    const { data: locationData, error: dbError } = await serviceSupabase
      .from('locations')
      .insert({
        image_url: imageUrl,
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

    // Return success response with location data
    return NextResponse.json(
      {
        success: true,
        message: "Location saved successfully",
        data: {
          imageUrl: imageUrl,
          fileName: fileName,
          latitude: lat,
          longitude: lng,
          userId,
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

