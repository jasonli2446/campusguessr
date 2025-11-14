"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatScore } from "@/lib/format-utils";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  gameId: string;
  username: string;
  score: number;
  createdAt: string;
}

export function LeaderboardPreview() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard?filter=all-time&limit=10");
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            No leaderboard entries yet. Be the first to claim the top spot!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top 10 Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.gameId}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.rank <= 3
                  ? "bg-gradient-to-r from-cwru-blue/10 to-transparent"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank) || (
                    <span className="text-lg font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{entry.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge
                variant={entry.rank === 1 ? "default" : "secondary"}
                className="text-lg font-bold px-4 py-1"
              >
                {formatScore(entry.score)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
