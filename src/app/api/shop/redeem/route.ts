import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import ShopItem from "@/models/ShopItem";
import Redemption from "@/models/Redemption";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    await dbConnect();

    // Get the item to know its cost
    const item = await ShopItem.findById(itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Use MongoDB Transaction to ensure full atomicity
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // Step 1: Atomically decrement quantity ONLY if > 0
      const updatedItem = await ShopItem.findOneAndUpdate(
        { _id: itemId, quantity: { $gt: 0 } },
        { $inc: { quantity: -1 } },
        { new: true, session: dbSession }
      );

      if (!updatedItem) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Item is out of stock" }, { status: 400 });
      }

      // Step 2: Atomically deduct points ONLY if user has enough
      const updatedUser = await User.findOneAndUpdate(
        { _id: session.user.id, points: { $gte: item.cost } },
        { $inc: { points: -item.cost } },
        { new: true, session: dbSession }
      );

      if (!updatedUser) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json(
          { error: "Insufficient points" },
          { status: 400 }
        );
      }

      // Step 3: Create redemption record
      await Redemption.create(
        [
          {
            userId: session.user.id,
            itemId,
            status: "pending",
            timestamp: new Date(),
          },
        ],
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      dbSession.endSession();

      return NextResponse.json({
        success: true,
        message: `Redeemed "${item.name}" for ${item.cost} points!`,
        remainingPoints: updatedUser.points,
        remainingStock: updatedItem.quantity,
      });
    } catch (transactionError) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw transactionError; // Passed to outer catch block
    }
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
