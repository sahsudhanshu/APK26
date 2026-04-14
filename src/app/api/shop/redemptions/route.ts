import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Redemption from "@/models/Redemption";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    await dbConnect();

    const redemptions = await Redemption.find({ itemId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("Redemptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
