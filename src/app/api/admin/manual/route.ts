import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Claim from "@/models/Claim";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, points, reason } = await req.json();

    if (!userId || points == null || !reason) {
      return NextResponse.json(
        { error: "userId, points, and reason are required" },
        { status: 400 }
      );
    }

    if (typeof points !== "number") {
      return NextResponse.json({ error: "Points must be a number" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user points atomically with bounds check
    const minRequired = points < 0 ? Math.abs(points) : 0;

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        availablePoints: { $gte: minRequired },
        totalPoints: { $gte: minRequired },
      },
      { $inc: { availablePoints: points, totalPoints: points } },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Cannot deduct more points than user has (or user not found)" },
        { status: 400 }
      );
    }

    // Create claim log entry AFTER updating successfully
    await Claim.create({
      userId,
      eventId: null,
      type: "manual",
      points,
      addedBy: session?.user?.email || "Unknown Admin",
      timestamp: new Date(),
      reason,
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser!.name,
        email: updatedUser!.email,
        totalPoints: updatedUser!.totalPoints,
        availablePoints: updatedUser!.availablePoints,
      },
    });

  } catch (error) {
    console.error("Manual points error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
