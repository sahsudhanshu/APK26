import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClaim extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId | null;
  type: "participation" | "winner" | "manual";
  points: number;
  addedBy: string;
  timestamp: Date;
  reason?: string;
}

const ClaimSchema = new Schema<IClaim>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", default: null },
  type: { type: String, enum: ["participation", "winner", "manual"], required: true },
  points: { type: Number, required: true },
  addedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reason: { type: String },
});

// Compound unique index: only one claim per user per event (for non-manual types)
// Manual claims don't have eventId, so this only applies to participation/winner claims
ClaimSchema.index(
  { userId: 1, eventId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: { $in: ["participation", "winner"] },
    },
  }
);

ClaimSchema.index({ userId: 1 });
ClaimSchema.index({ timestamp: -1 });

const Claim: Model<IClaim> =
  mongoose.models.Claim || mongoose.model<IClaim>("Claim", ClaimSchema);

export default Claim;
