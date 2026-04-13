import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, pointsParticipation, pointsWinner } = body;

    if (!name || pointsParticipation == null) {
      return NextResponse.json({ error: "Name and pointsParticipation are required" }, { status: 400 });
    }

    if (typeof pointsParticipation !== "number" || pointsParticipation < 0) {
      return NextResponse.json({ error: "Invalid pointsParticipation" }, { status: 400 });
    }

    await dbConnect();

    const event = await Event.create({
      name,
      pointsParticipation,
      pointsWinner: pointsWinner || 0,
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
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Event list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
