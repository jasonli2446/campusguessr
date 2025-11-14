"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatScore } from "@/lib/format-utils";
import { Trophy, Medal, Award, Clock, Calendar, Infinity } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  gameId: string;
  username: string;
  score: number;
  createdAt: string;
}

type FilterType = "all-time" | "week" | "today";

export function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all-time");

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?filter=${filter}&limit=100`);
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-7 h-7 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-7 h-7 text-gray-400" />;
    if (rank === 3) return <Award className="w-7 h-7 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    return "bg-muted";
  };

  return (
    <div className="container mx-auto max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
          <h1 className="text-5xl font-bold text-cwru-blue dark:text-cwru-light-blue">
            Leaderboard
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Compete with players from around campus
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        <Button
          variant={filter === "all-time" ? "default" : "outline"}
          onClick={() => setFilter("all-time")}
          className="gap-2"
        >
          <Infinity className="w-4 h-4" />
          All Time
        </Button>
        <Button
          variant={filter === "week" ? "default" : "outline"}
          onClick={() => setFilter("week")}
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          This Week
        </Button>
        <Button
          variant={filter === "today" ? "default" : "outline"}
          onClick={() => setFilter("today")}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          Today
        </Button>
      </div>

      {/* Leaderboard Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {filter === "all-time" && "All-Time Top Scores"}
            {filter === "week" && "This Week's Top Scores"}
            {filter === "today" && "Today's Top Scores"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No scores yet for this timeframe.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Be the first to claim the top spot!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.gameId}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    entry.rank <= 3
                      ? "bg-gradient-to-r from-cwru-blue/10 via-transparent to-transparent border-2 border-cwru-blue/20"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-5 flex-1">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-14 h-14">
                      {getRankIcon(entry.rank) || (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                          <span className="text-xl font-bold">{entry.rank}</span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className="font-bold text-lg">{entry.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <Badge
                    variant={entry.rank === 1 ? "default" : "secondary"}
                    className={`text-xl font-bold px-6 py-2 ${
                      entry.rank === 1
                        ? "bg-gradient-to-r from-cwru-blue to-cwru-true-blue"
                        : ""
                    }`}
                  >
                    {formatScore(entry.score)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Think you can beat these scores?
        </p>
        <Link href="/">
          <Button size="lg" className="bg-cwru-blue hover:bg-cwru-dark-blue">
            Play Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
