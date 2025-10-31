"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function PlayButton() {
  const router = useRouter();

  const handlePlay = async () => {
    try {
      // Call backend to initialize game session with random locations
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start game');
      }

      const { gameId } = await response.json();
      console.log('Starting game with ID:', gameId);

      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  return (
    <Button 
      onClick={handlePlay}
      size="lg"
      className="bg-cwru-blue hover:bg-cwru-dark-blue text-white px-16 py-8 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
    >
      Play CampusGuessr
    </Button>
  );
}
