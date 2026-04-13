import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ShopItem from "@/models/ShopItem";

export async function GET() {
  try {
    await dbConnect();
    const items = await ShopItem.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Shop items error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, cost, quantity } = await req.json();

    if (!name || cost == null || quantity == null) {
      return NextResponse.json({ error: "name, cost, quantity required" }, { status: 400 });
    }

    if (typeof cost !== "number" || cost <= 0) {
      return NextResponse.json({ error: "Invalid cost" }, { status: 400 });
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    await dbConnect();

    const item = await ShopItem.create({ name, cost, quantity });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Shop create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
