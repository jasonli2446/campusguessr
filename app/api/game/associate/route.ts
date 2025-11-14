import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Fetch the game session
    const { data: gameSession, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !gameSession) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    // Check if game is already associated with a user
    if (gameSession.user_id) {
      return NextResponse.json(
        { error: "This game is already associated with a user" },
        { status: 400 }
      );
    }

    // Check if game is completed (all 5 rounds)
    if (gameSession.current_round !== 5) {
      return NextResponse.json(
        { error: "Game must be completed (all 5 rounds) to be saved" },
        { status: 400 }
      );
    }

    // Associate the game with the user
    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({ user_id: user.id })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error associating game:", updateError);
      return NextResponse.json(
        { error: "Failed to associate game with user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Game successfully saved to your account!",
    });
  } catch (error) {
    console.error("Game association error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
