import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Claim from "@/models/Claim";
import { rateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = rateLimiter(req, 5, 20000); // Max 5 claims checking per 20 seconds
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    await dbConnect();

    // Get event details and check if active
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.active) {
      return NextResponse.json(
        { error: "This event is no longer accepting claims" },
        { status: 400 }
      );
    }

    // Atomic duplicate prevention: try to insert, fail on duplicate
    try {
      await Claim.create({
        userId: session.user.id,
        eventId: event._id,
        type: "participation",
        points: event.pointsParticipation,
        addedBy: "qr-system",
        timestamp: new Date(),
      });
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
        return NextResponse.json(
          { error: "You have already claimed points for this event" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Add points to user atomically
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { points: event.pointsParticipation },
    });

    return NextResponse.json({
      success: true,
      points: event.pointsParticipation,
      eventName: event.name,
      message: `+${event.pointsParticipation} points for ${event.name}!`,
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
