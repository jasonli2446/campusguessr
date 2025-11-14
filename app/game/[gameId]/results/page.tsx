import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import {
  formatScore,
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

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

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

  // Check if this game is associated with a user
  const isAnonymousGame = !gameSession.user_id;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-cwru-blue dark:text-cwru-light-blue">
              Game Complete!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s how you did on your CampusGuessr adventure
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
          <div className="grid gap-3">
            {gameSession.guesses.map((guess: {
              round: number;
              score: number;
            }, index: number) => {
              const scorePercent = (guess.score / 5000) * 100;
              let colorClass = "bg-red-500";
              if (scorePercent >= 80) colorClass = "bg-green-500";
              else if (scorePercent >= 50) colorClass = "bg-yellow-500";
              else if (scorePercent >= 30) colorClass = "bg-orange-500";

              return (
                <Card key={index} className="overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className="flex-shrink-0 w-24">
                      <p className="text-sm font-medium text-muted-foreground">Round {guess.round}</p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${colorClass} transition-all duration-500`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right min-w-[100px]">
                      <p className="text-2xl font-bold text-cwru-blue dark:text-cwru-light-blue">
                        {formatScore(guess.score)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="mb-8">
          <LeaderboardPreview />
        </div>

        {/* Login to Save Score (for anonymous players) */}
        {isAnonymousGame && !user && (
          <Card className="mb-8 border-2 border-cwru-true-blue bg-cwru-light-blue/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Want to save your score?</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to compete on the leaderboard!
                </p>
                <Link href={`/auth/login?returnTo=/game/${gameId}/results`}>
                  <Button size="lg" className="bg-cwru-blue hover:bg-cwru-dark-blue">
                    Login to Save Score
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg">
              View Leaderboard
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
    </>
  );
}
