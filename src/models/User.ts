import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  points: number;
  role: "user" | "admin";
  phone?: string;
  image?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ points: -1 }); // For leaderboard sorting

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
