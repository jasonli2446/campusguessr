import { createClient } from "@/lib/supabase/server";
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

    // Decode the base64 image
    // Remove the data:image/...;base64, prefix if present
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Extract file extension from base64 string (if present)
    let fileExtension = 'jpg'; // default
    if (image.startsWith('data:image/')) {
      const mimeType = image.substring(11, image.indexOf(';'));
      fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${username}_${timestamp}_${randomString}.${fileExtension}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
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
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    // Return success response with image URL
    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        data: {
          imageUrl: publicUrl,
          fileName: fileName,
          latitude,
          longitude,
          username
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

