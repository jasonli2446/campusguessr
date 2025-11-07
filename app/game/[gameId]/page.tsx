import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GameClient from "./game-client";

interface PageProps {
  params: Promise<{
    gameId: string;
  }>;
}

export default async function GamePage({ params }: PageProps) {
  const { gameId } = await params;
  const supabase = await createClient();

  // Fetch the game session
  const { data: gameSession, error: sessionError } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("id", gameId)
    .single();

  if (sessionError || !gameSession) {
    console.error("Game session not found:", sessionError);
    notFound();
  }

  // Fetch the current location details
  const currentLocationId = gameSession.location_ids[gameSession.current_round - 1];

  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("*")
    .eq("id", currentLocationId)
    .single();

  if (locationError || !location) {
    console.error("Location not found:", locationError);
    notFound();
  }

  return (
    <GameClient
      gameSession={gameSession}
      currentLocation={location}
    />
  );
}
