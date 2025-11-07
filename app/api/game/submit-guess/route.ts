import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateDistance, calculateScore } from "@/lib/game-utils";

interface SubmitGuessRequest {
  gameId: string;
  guessLatitude: number;
  guessLongitude: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitGuessRequest = await request.json();
    const { gameId, guessLatitude, guessLongitude } = body;

    if (!gameId || !guessLatitude || !guessLongitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the game session
    const { data: gameSession, error: sessionError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (sessionError || !gameSession) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }

    // Get the current location
    const currentLocationId =
      gameSession.location_ids[gameSession.current_round - 1];

    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("*")
      .eq("id", currentLocationId)
      .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Calculate distance and score
    const distance = calculateDistance(
      guessLatitude,
      guessLongitude,
      location.latitude,
      location.longitude
    );

    const score = calculateScore(distance);

    // Update game session with the guess
    const newGuess = {
      round: gameSession.current_round,
      locationId: currentLocationId,
      guessLatitude,
      guessLongitude,
      actualLatitude: location.latitude,
      actualLongitude: location.longitude,
      distance,
      score,
      timestamp: new Date().toISOString(),
    };

    const updatedGuesses = [...gameSession.guesses, newGuess];
    const newTotalScore = gameSession.total_score + score;
    const isGameComplete = gameSession.current_round >= 5;
    const newRound = isGameComplete
      ? gameSession.current_round
      : gameSession.current_round + 1;

    // Update the game session
    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({
        current_round: newRound,
        total_score: newTotalScore,
        guesses: updatedGuesses,
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating game session:", updateError);
      return NextResponse.json(
        { error: "Failed to update game session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      distance: Math.round(distance),
      score,
      totalScore: newTotalScore,
      gameComplete: isGameComplete,
      actualLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  } catch (error) {
    console.error("Unexpected error in submit-guess:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
