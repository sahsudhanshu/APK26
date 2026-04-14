import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Claim from "@/models/Claim";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, pointsParticipation, pointsWinner, maxClaimsPerUser } = body;

    if (!name || pointsParticipation == null) {
      return NextResponse.json({ error: "Name and pointsParticipation are required" }, { status: 400 });
    }

    if (typeof pointsParticipation !== "number" || pointsParticipation < 0) {
      return NextResponse.json({ error: "Invalid pointsParticipation" }, { status: 400 });
    }

    if (maxClaimsPerUser != null && (typeof maxClaimsPerUser !== "number" || maxClaimsPerUser < 1)) {
      return NextResponse.json({ error: "Invalid maxClaimsPerUser" }, { status: 400 });
    }

    await dbConnect();

    const event = await Event.create({
      name,
      pointsParticipation,
      pointsWinner: pointsWinner || 0,
      maxClaimsPerUser: maxClaimsPerUser || 1,
      createdBy: session?.user?.email || "Unknown Admin",
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Event create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    const counts = await Claim.aggregate([
      { $match: { eventId: { $ne: null } } },
      {
        $group: {
          _id: "$eventId",
          totalClaims: { $sum: 1 },
          participationClaims: {
            $sum: { $cond: [{ $eq: ["$type", "participation"] }, 1, 0] },
          },
          winnerClaims: {
            $sum: { $cond: [{ $eq: ["$type", "winner"] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = new Map(
      counts.map((entry) => [String(entry._id), entry])
    );

    const enrichedEvents = events.map((event) => {
      const stats = countMap.get(String(event._id));
      return {
        ...event,
        claimsCount: stats?.totalClaims || 0,
        participationClaims: stats?.participationClaims || 0,
        winnerClaims: stats?.winnerClaims || 0,
      };
    });

    return NextResponse.json({ events: enrichedEvents });
  } catch (error) {
    console.error("Event list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
