import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, image } = await req.json();

    if (name && (name.length < 2 || name.length > 50)) {
      return NextResponse.json({ error: "Name must be between 2 and 50 characters" }, { status: 400 });
    }

    if (phone && (phone.length < 10 || phone.length > 15)) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    if (image && image.length > 150 * 1024) { // Strictly prevent anything larger than 150KB base64 string
      return NextResponse.json({ error: "Selected image is too large even after compression." }, { status: 400 });
    }

    const updateData: Partial<{ name: string; phone: string; image: string; hasOnboarded: boolean }> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (image !== undefined) updateData.image = image;
    if (phone !== undefined) updateData.hasOnboarded = true;

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found either in Session or Database." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile completely updated.",
      name: updatedUser.name,
      phone: updatedUser.phone,
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Profile update catastrophic crash:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
