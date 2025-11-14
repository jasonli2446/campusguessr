import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (optional - supports both anonymous and authenticated play)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all available locations
    const { data: locations, error: locationsError } = await supabase
      .from("locations")
      .select("id");

    if (locationsError) {
      console.error("Error fetching locations:", locationsError);
      return NextResponse.json(
        { error: "Failed to fetch locations" },
        { status: 500 }
      );
    }

    if (!locations || locations.length < 5) {
      return NextResponse.json(
        { error: "Not enough locations in database. Need at least 5 images." },
        { status: 400 }
      );
    }

    // Randomly select 5 unique locations
    const shuffled = [...locations].sort(() => Math.random() - 0.5);
    const selectedLocationIds = shuffled.slice(0, 5).map((loc) => loc.id);

    // Create a new game session
    const { data: gameSession, error: sessionError } = await supabase
      .from("game_sessions")
      .insert({
        current_round: 1,
        total_score: 0,
        location_ids: selectedLocationIds,
        guesses: [],
        user_id: user?.id || null, // Store user ID if authenticated, null if anonymous
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating game session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create game session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      gameId: gameSession.id,
      locationIds: selectedLocationIds,
      currentRound: 1,
    });
  } catch (error) {
    console.error("Unexpected error in game start:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
