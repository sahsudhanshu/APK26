import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Claim from "@/models/Claim";
import { rateLimiter } from "@/lib/rateLimit";
import Redemption from "@/models/Redemption";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = rateLimiter(req, 15, 10000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
    }

    await dbConnect();

    const [user, claims, redemptions] = await Promise.all([
      User.findById(session.user.id).lean(),
      Claim.find({ userId: session.user.id })
        .populate("eventId", "name")
        .sort({ timestamp: -1 })
        .lean(),
      Redemption.find({ userId: session.user.id })
        .populate("itemId", "name cost")
        .sort({ timestamp: -1 })
        .lean(),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        totalPoints: user.totalPoints ?? 0,
        availablePoints: user.availablePoints ?? 0,
        role: user.role,
        createdAt: user.createdAt,
      },
      claims,
      redemptions,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
