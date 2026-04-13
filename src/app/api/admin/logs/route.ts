import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Claim from "@/models/Claim";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    await dbConnect();

    const [logs, total] = await Promise.all([
      Claim.find()
        .populate("userId", "name email")
        .populate("eventId", "name")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
