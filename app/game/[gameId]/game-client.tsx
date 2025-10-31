"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PhotoSphereViewer } from "@/components/gameplay/photo-sphere-viewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRound, formatScore } from "@/lib/format-utils";

// Dynamically import CampusMap to avoid SSR issues
const CampusMap = dynamic(
  () => import("@/components/gameplay/CampusMap").then((mod) => mod.CampusMap),
  { ssr: false }
);

interface Location {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface GameSession {
  id: string;
  current_round: number;
  total_score: number;
  location_ids: string[];
  guesses: any[];
  created_at: string;
}

interface GameClientProps {
  gameSession: GameSession;
  currentLocation: Location;
}

export default function GameClient({
  gameSession,
  currentLocation,
}: GameClientProps) {
  const router = useRouter();
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePinDrop = (lat: number, lng: number) => {
    setGuess({ lat, lng });
  };

  const handleSubmitGuess = async () => {
    if (!guess) {
      alert("Please drop a pin on the map to make your guess!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/game/submit-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: gameSession.id,
          guessLatitude: guess.lat,
          guessLongitude: guess.lng,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit guess");
      }

      const result = await response.json();

      // Show result (you can make this prettier with a modal later)
      alert(
        `Distance: ${result.distance}m\nScore: ${result.score}\nTotal Score: ${result.totalScore}`
      );

      // Refresh the page to load next round or show results
      if (result.gameComplete) {
        router.push(`/game/${gameSession.id}/results`);
      } else {
        router.refresh();
        setGuess(null);
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
      alert("Failed to submit guess. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-lg font-semibold">
              {formatRound(gameSession.current_round, 5)}
            </span>
            <span className="text-muted-foreground">
              Score: {formatScore(gameSession.total_score)}
            </span>
          </div>
          {guess && (
            <Button
              onClick={handleSubmitGuess}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Guess"}
            </Button>
          )}
        </div>
      </div>

      {/* 360° Photo Viewer */}
      <div className="flex-1 relative">
        <PhotoSphereViewer imageUrl={currentLocation.image_url} />
      </div>

      {/* Map Container */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="p-2 shadow-xl">
          <div className="w-80 h-80">
            <CampusMap
              onPinDrop={handlePinDrop}
              selectedLocation={guess}
            />
          </div>
          {guess && (
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Pin dropped at {guess.lat.toFixed(4)}, {guess.lng.toFixed(4)}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
