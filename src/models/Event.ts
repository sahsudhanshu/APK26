import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  name: string;
  pointsParticipation: number;
  pointsWinner: number;
  maxClaimsPerUser: number;
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  pointsParticipation: { type: Number, required: true },
  pointsWinner: { type: Number, default: 0 },
  maxClaimsPerUser: { type: Number, default: 1, min: 1 },
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
