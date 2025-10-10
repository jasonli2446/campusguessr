"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function PlayButton() {
  const router = useRouter();

  const handlePlay = () => {
    const sessionId = crypto.randomUUID();
    // Temporary alert since sessions not implemented yet
    alert(`Session ID generated: ${sessionId}`);
    // Push to game session
    router.push(`/game/${sessionId}`);
  };

  return (
    <Button 
      onClick={handlePlay}
      size="lg"
      className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-8 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
    >
      🎮 Play CampusGuessr
    </Button>
  );
}
