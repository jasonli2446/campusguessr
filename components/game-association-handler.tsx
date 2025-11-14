"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function GameAssociationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const returnTo = searchParams.get("returnTo");

    // Check if we're returning from login with a game ID
    if (returnTo && returnTo.includes("/game/") && returnTo.includes("/results")) {
      const gameIdMatch = returnTo.match(/\/game\/([^/]+)\/results/);
      const gameId = gameIdMatch?.[1];

      if (gameId) {
        associateGame(gameId, returnTo);
      } else {
        router.push(returnTo);
      }
    }
  }, [searchParams, router]);

  const associateGame = async (gameId: string, returnTo: string) => {
    try {
      const response = await fetch("/api/game/associate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Your score has been saved to the leaderboard!");
        setTimeout(() => {
          router.push(returnTo);
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to save your score");
        setTimeout(() => {
          router.push(returnTo);
        }, 3000);
      }
    } catch (error) {
      console.error("Association error:", error);
      setStatus("error");
      setMessage("An error occurred while saving your score");
      setTimeout(() => {
        router.push(returnTo);
      }, 3000);
    }
  };

  if (status === "loading") {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cwru-blue mx-auto mb-4" />
            <p className="text-muted-foreground">Saving your score...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="max-w-md mx-auto mt-8 border-2 border-green-500">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8 border-2 border-red-500">
      <CardContent className="pt-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </CardContent>
    </Card>
  );
}
