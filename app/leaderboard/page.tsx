import { Navbar } from "@/components/navbar";
import { LeaderboardClient } from "@/components/leaderboard-client";

export default function LeaderboardPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <LeaderboardClient />
      </div>
    </>
  );
}
