import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    await dbConnect();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // QR payload is simply the eventId — no JWT, no expiry
    // The QR stays valid as long as event.active is true
    const qrPayload = JSON.stringify({ eventId });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: "#00d4ff",
        light: "#0a0e1a",
      },
    });

    return NextResponse.json({
      success: true,
      qrDataUrl,
      eventName: event.name,
      active: event.active,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
