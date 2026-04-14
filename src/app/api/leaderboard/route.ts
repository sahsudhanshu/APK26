import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { rateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = rateLimiter(req, 20, 10000); // 20 requests per 10s
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();

    const users = await User.find({}, { name: 1, totalPoints: 1, email: 1 })
      .sort({ totalPoints: -1 })
      .limit(100)
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      points: user.totalPoints ?? 0,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
