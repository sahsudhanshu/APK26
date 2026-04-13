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

    const users = await User.find({}, { name: 1, points: 1, email: 1 })
      .sort({ points: -1 })
      .limit(100)
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      points: user.points,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
