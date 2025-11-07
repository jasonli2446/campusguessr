"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhotoSphereViewer from "@/components/gameplay/photo-sphere-viewer";
import CampusMap from "@/components/gameplay/CampusMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatScore, formatDistance, getScoreQuality, getDistanceQuality } from "@/lib/format-utils";

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

interface RoundResult {
  distance: number;
  score: number;
  totalScore: number;
  gameComplete: boolean;
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
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const totalRounds = 5;

  // Trigger map resize when expansion state changes
  useEffect(() => {
    setMapResizeTrigger(prev => prev + 1);
  }, [isMapExpanded]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitting || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        // When timer reaches 0, auto-submit with current guess or center of campus
        if (newTime === 0 && !showResult && !isSubmitting) {
          handleGuess();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, showResult]);

  const handlePinDrop = (lat: number, lng: number) => {
    setGuessedLocation({ lat, lng });
  };

  const handleGuess = async () => {
    // If no guess, use center of campus (worst possible score)
    const guessLat = guessedLocation?.lat ?? 41.5045;
    const guessLng = guessedLocation?.lng ?? -81.6087;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/game/submit-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: gameSession.id,
          guessLatitude: guessLat,
          guessLongitude: guessLng,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit guess");
      }

      const result = await response.json();
      setRoundResult(result);
      setShowResult(true);

      // Auto-advance after 4 seconds
      setTimeout(() => {
        handleNextRound();
      }, 4000);

    } catch (error) {
      console.error("Failed to submit guess:", error);
      alert("Failed to submit guess. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleNextRound = () => {
    if (roundResult?.gameComplete) {
      router.push(`/game/${gameSession.id}/results`);
    } else {
      // Reset state for next round
      setShowResult(false);
      setRoundResult(null);
      setGuessedLocation(null);
      setIsSubmitting(false);
      setTimeLeft(60);
      router.refresh();
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
              disabled={!guessedLocation || isSubmitting || showResult}
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
            selectedLocation={
              showResult && roundResult
                ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                : null
            }
            resetPin={!showResult && !guessedLocation}
          />
        </Card>

        {/* Map instruction overlay */}
        {!guessedLocation && !showResult && (
          <div className="absolute top-2 left-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded text-xs text-center font-medium text-gray-700 dark:text-gray-300 pointer-events-none">
            Click on the map to drop your guess pin
          </div>
        )}

        {guessedLocation && !isSubmitting && !showResult && (
          <div className="absolute top-2 left-2 right-2 bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded text-xs text-center font-medium text-white pointer-events-none">
            Pin dropped! Click &quot;Make Guess&quot; to submit
          </div>
        )}
      </div>

      {/* Results Overlay */}
      {showResult && roundResult && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="bg-white dark:bg-gray-900 p-8 max-w-lg w-full mx-4 border-4 border-cwru-blue shadow-2xl">
            <div className="text-center space-y-6">
              {/* Round Complete Header */}
              <div>
                <h2 className="text-3xl font-bold text-cwru-blue dark:text-cwru-light-blue mb-2">
                  Round {gameSession.current_round} Complete!
                </h2>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">
                  Distance
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {formatDistance(roundResult.distance)}
                </div>
                <div className="text-lg text-green-600 dark:text-green-400 font-semibold">
                  {getDistanceQuality(roundResult.distance)}
                </div>
              </div>

              {/* Score */}
              <div className="space-y-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">
                  Points Earned
                </div>
                <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                  +{formatScore(roundResult.score)}
                </div>
                <div className="text-lg text-cwru-blue dark:text-cwru-light-blue font-semibold">
                  {getScoreQuality(roundResult.score, 5000)}
                </div>
              </div>

              {/* Total Score */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                  Total Score
                </div>
                <div className="text-3xl font-bold text-cwru-blue dark:text-cwru-light-blue">
                  {formatScore(roundResult.totalScore)}
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <Button
                  onClick={handleNextRound}
                  size="lg"
                  className="w-full bg-cwru-blue hover:bg-cwru-dark-blue text-white text-lg font-semibold py-6"
                >
                  {roundResult.gameComplete ? 'View Final Results' : 'Next Round'}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Auto-advancing in a few seconds...
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
