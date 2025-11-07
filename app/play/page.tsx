"use client";

import { useState, useEffect } from "react";
import PhotoSphereViewer from "@/components/gameplay/photo-sphere-viewer";
import CampusMap from "@/components/gameplay/CampusMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatScore } from "@/lib/format-utils";
import { Coordinates } from "@/types/game";

export default function PlayPage() {
  const supabaseImageUrl = "https://wwewcdgukzswaejezywc.supabase.co/storage/v1/object/public/images/test_panorama.jpg";

  // Game state
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per round
  const [guessedLocation, setGuessedLocation] = useState<Coordinates | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [mapResizeTrigger, setMapResizeTrigger] = useState(0);

  const totalRounds = 5;

  // Trigger map resize when expansion state changes
  useEffect(() => {
    setMapResizeTrigger(prev => prev + 1);
  }, [isMapExpanded]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || hasGuessed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasGuessed]);

  const handlePinDrop = (lat: number, lng: number) => {
    setGuessedLocation({ lat, lng });
  };

  const handleGuess = () => {
    if (!guessedLocation) {
      alert("Please drop a pin on the map first!");
      return;
    }

    setHasGuessed(true);
    // TODO: Calculate score and show results
    // For now, just add placeholder score
    setTotalScore(prev => prev + 4250);

    // TODO: Show results modal/overlay with:
    // - Distance from actual location
    // - Points earned this round
    // - Line drawn between guess and actual location

    // Move to next round after delay
    setTimeout(() => {
      if (currentRound < totalRounds) {
        setCurrentRound(prev => prev + 1);
        setTimeLeft(60);
        setGuessedLocation(null);
        setHasGuessed(false);
      } else {
        // Game over - show final results
        alert(`Game Over! Final Score: ${formatScore(totalScore + 4250)}`);
      }
    }, 3000);
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
        imageUrl={supabaseImageUrl}
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
                  {currentRound}/{totalRounds}
                </div>
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Score</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatScore(totalScore)}
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
              disabled={!guessedLocation || hasGuessed}
              size="lg"
              className="bg-cwru-blue hover:bg-cwru-dark-blue text-white px-8 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasGuessed ? 'Processing...' : 'Make Guess'}
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

        {guessedLocation && !hasGuessed && (
          <div className="absolute top-2 left-2 right-2 bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded text-xs text-center font-medium text-white pointer-events-none">
            Pin dropped! Click &quot;Make Guess&quot; to submit
          </div>
        )}
      </div>
    </div>
  );
}
