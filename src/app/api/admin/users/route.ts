import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    await dbConnect();

    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(query, { name: 1, email: 1, points: 1, role: 1 })
      .sort({ points: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
