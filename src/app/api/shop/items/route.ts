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

    const { name, cost, quantity, imageUrl, maxRedeemPerUser } = await req.json();

    if (!name || cost == null || quantity == null) {
      return NextResponse.json({ error: "name, cost, quantity required" }, { status: 400 });
    }

    if (typeof cost !== "number" || cost <= 0) {
      return NextResponse.json({ error: "Invalid cost" }, { status: 400 });
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (maxRedeemPerUser != null && (typeof maxRedeemPerUser !== "number" || maxRedeemPerUser < 1)) {
      return NextResponse.json({ error: "Invalid maxRedeemPerUser" }, { status: 400 });
    }

    if (imageUrl != null && typeof imageUrl !== "string") {
      return NextResponse.json({ error: "Invalid imageUrl" }, { status: 400 });
    }

    await dbConnect();

    const item = await ShopItem.create({
      name,
      cost,
      quantity,
      imageUrl: imageUrl || "",
      maxRedeemPerUser: maxRedeemPerUser || 1,
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Shop create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { itemId, name, cost, quantity, imageUrl, maxRedeemPerUser } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (name != null) update.name = name;
    if (cost != null) update.cost = cost;
    if (quantity != null) update.quantity = quantity;
    if (imageUrl != null) update.imageUrl = imageUrl;
    if (maxRedeemPerUser != null) update.maxRedeemPerUser = maxRedeemPerUser;

    if (typeof update.name !== "undefined" && typeof update.name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    if (typeof update.cost !== "undefined" && (typeof update.cost !== "number" || update.cost <= 0)) {
      return NextResponse.json({ error: "Invalid cost" }, { status: 400 });
    }

    if (typeof update.quantity !== "undefined" && (typeof update.quantity !== "number" || update.quantity < 0)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (typeof update.imageUrl !== "undefined" && typeof update.imageUrl !== "string") {
      return NextResponse.json({ error: "Invalid imageUrl" }, { status: 400 });
    }

    if (typeof update.maxRedeemPerUser !== "undefined" && (typeof update.maxRedeemPerUser !== "number" || update.maxRedeemPerUser < 1)) {
      return NextResponse.json({ error: "Invalid maxRedeemPerUser" }, { status: 400 });
    }

    await dbConnect();

    const item = await ShopItem.findByIdAndUpdate(itemId, update, { returnDocument: "after" });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Shop update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
