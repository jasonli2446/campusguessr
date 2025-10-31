import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatScore,
  formatDistance,
  getScoreQuality,
  getMaxScore,
} from "@/lib/format-utils";

interface PageProps {
  params: Promise<{
    gameId: string;
  }>;
}

export default async function ResultsPage({ params }: PageProps) {
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

  const maxScore = getMaxScore(5);
  const scorePercentage = Math.round((gameSession.total_score / maxScore) * 100);
  const quality = getScoreQuality(gameSession.total_score, maxScore);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Game Complete!</h1>
          <p className="text-muted-foreground">
            Here's how you did on your CampusGuessr adventure
          </p>
        </div>

        {/* Total Score Card */}
        <Card className="mb-8 border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Final Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {formatScore(gameSession.total_score)}
            </div>
            <div className="text-muted-foreground mb-4">
              out of {formatScore(maxScore)} ({scorePercentage}%)
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {quality}
            </Badge>
          </CardContent>
        </Card>

        {/* Round-by-Round Breakdown */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Round Breakdown</h2>
          {gameSession.guesses.map((guess: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Round {guess.round}</span>
                  <Badge variant="outline">{formatScore(guess.score)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Distance</p>
                    <p className="font-semibold">{formatDistance(guess.distance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className="font-semibold">{formatScore(guess.score)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Guess</p>
                    <p className="font-mono text-xs">
                      {guess.guessLatitude.toFixed(4)}, {guess.guessLongitude.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Actual Location</p>
                    <p className="font-mono text-xs">
                      {guess.actualLatitude.toFixed(4)}, {guess.actualLongitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="bg-cwru-blue hover:bg-cwru-dark-blue">
              Play Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
