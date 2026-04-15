import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  totalPoints: number;
  availablePoints: number;
  hasOnboarded: boolean;
  role: "user" | "admin";
  phone?: string;
  image?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 },
  hasOnboarded: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ totalPoints: -1 }); // For leaderboard sorting

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
