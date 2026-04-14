import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

// Toggle event active status
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { eventId, active } = await req.json();

    if (!eventId || typeof active !== "boolean") {
      return NextResponse.json({ error: "eventId and active (boolean) required" }, { status: 400 });
    }

    await dbConnect();

    const event = await Event.findByIdAndUpdate(
      eventId,
      { active },
      { returnDocument: "after" }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: { _id: event._id, name: event.name, active: event.active },
    });
  } catch (error) {
    console.error("Toggle event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
