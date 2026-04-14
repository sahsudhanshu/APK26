import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  status: "pending" | "completed";
  timestamp: Date;
}

const RedemptionSchema = new Schema<IRedemption>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  itemId: { type: Schema.Types.ObjectId, ref: "ShopItem", required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  timestamp: { type: Date, default: Date.now },
});

RedemptionSchema.index({ userId: 1, timestamp: -1 });
RedemptionSchema.index({ itemId: 1, timestamp: -1 });

const Redemption: Model<IRedemption> =
  mongoose.models.Redemption || mongoose.model<IRedemption>("Redemption", RedemptionSchema);

export default Redemption;
