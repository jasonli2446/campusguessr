"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhotoSphereViewer from "@/components/gameplay/photo-sphere-viewer";
import CampusMap from "@/components/gameplay/CampusMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatScore } from "@/lib/format-utils";

interface Location {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface Guess {
  round: number;
  locationId: string;
  guessLatitude: number;
  guessLongitude: number;
  actualLatitude: number;
  actualLongitude: number;
  distance: number;
  score: number;
  timestamp: string;
}

interface GameSession {
  id: string;
  current_round: number;
  total_score: number;
  location_ids: string[];
  guesses: Guess[];
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
  const [guessedLocation, setGuessedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapResizeTrigger, setMapResizeTrigger] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per round

  const totalRounds = 5;

  // Trigger map resize when expansion state changes
  useEffect(() => {
    setMapResizeTrigger(prev => prev + 1);
  }, [isMapExpanded]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting]);

  const handlePinDrop = (lat: number, lng: number) => {
    setGuessedLocation({ lat, lng });
  };

  const handleGuess = async () => {
    if (!guessedLocation) {
      alert("Please drop a pin on the map first!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/game/submit-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: gameSession.id,
          guessLatitude: guessedLocation.lat,
          guessLongitude: guessedLocation.lng,
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

      // Navigate to results or refresh for next round
      if (result.gameComplete) {
        router.push(`/game/${gameSession.id}/results`);
      } else {
        router.refresh();
        setGuessedLocation(null);
        setTimeLeft(60); // Reset timer for next round
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
      alert("Failed to submit guess. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-screen relative">
      {/* 360° Photo Sphere Viewer */}
      <PhotoSphereViewer
        imageUrl={currentLocation.image_url}
        height="100vh"
        width="100%"
        className="w-full h-screen"
      />

      {/* Top Stats Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-8">
              {/* Round Counter */}
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Round</div>
                <div className="text-2xl font-bold text-cwru-blue dark:text-cwru-light-blue">
                  {gameSession.current_round}/{totalRounds}
                </div>
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Score</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatScore(gameSession.total_score)}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Time Left</div>
                <div className={`text-2xl font-bold ${
                  timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* Guess Button */}
            <Button
              onClick={handleGuess}
              disabled={!guessedLocation || isSubmitting}
              size="lg"
              className="bg-cwru-blue hover:bg-cwru-dark-blue text-white px-8 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Make Guess'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Campus Map in bottom right corner */}
      <div
        className={`absolute bottom-4 right-4 z-10 transition-all duration-300 ease-in-out ${
          isMapExpanded ? 'w-[600px] h-[450px]' : 'w-80 h-60'
        }`}
        onMouseEnter={() => setIsMapExpanded(true)}
        onMouseLeave={() => setIsMapExpanded(false)}
      >
        <Card className="w-full h-full overflow-hidden shadow-2xl border-2 border-gray-300 dark:border-gray-600">
          <CampusMap
            className="w-full h-full"
            onPinDrop={handlePinDrop}
            triggerResize={mapResizeTrigger}
          />
        </Card>

        {/* Map instruction overlay */}
        {!guessedLocation && (
          <div className="absolute top-2 left-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded text-xs text-center font-medium text-gray-700 dark:text-gray-300 pointer-events-none">
            Click on the map to drop your guess pin
          </div>
        )}

        {guessedLocation && !isSubmitting && (
          <div className="absolute top-2 left-2 right-2 bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded text-xs text-center font-medium text-white pointer-events-none">
            Pin dropped! Click &quot;Make Guess&quot; to submit
          </div>
        )}
      </div>
    </div>
  );
}
