import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all-time";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build date filter based on requested timeframe
    let dateFilter = "";
    const now = new Date();

    if (filter === "today") {
      const today = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = today.toISOString();
    } else if (filter === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = weekAgo.toISOString();
    }

    // Base query for completed games with users
    let query = supabase
      .from("game_sessions")
      .select("id, user_id, total_score, created_at")
      .eq("current_round", 5) // Only completed games
      .not("user_id", "is", null) // Only authenticated users
      .order("total_score", { ascending: false })
      .order("created_at", { ascending: true }) // Tiebreaker: earlier is better
      .limit(limit);

    // Apply date filter if specified
    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data: leaderboardData, error } = await query;

    if (error) {
      console.error("Leaderboard query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    // Get user emails for each entry
    const leaderboard = await Promise.all(
      leaderboardData.map(async (entry, index) => {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(entry.user_id);
        return {
          rank: index + 1,
          gameId: entry.id,
          username: userData?.user?.email || "Anonymous",
          score: entry.total_score,
          createdAt: entry.created_at,
        };
      })
    );

    return NextResponse.json({ leaderboard, filter });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
