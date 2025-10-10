"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function PlayButton() {
  const router = useRouter();

  const handlePlay = async () => {
    try {
      // TODO: Backend /api/game/start endpoint needs to be implemented
      // Expected response: { game_id: "uuid" }

      // Temporary: Generate UUID on client until backend is ready
      const gameId = crypto.randomUUID();
      console.log('Starting game with ID:', gameId);

      /* When backend is ready, replace above with:
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const { game_id } = await response.json();
      router.push(`/game/${game_id}`);
      */

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
