import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShopItem extends Document {
  name: string;
  cost: number;
  quantity: number;
  imageUrl?: string;
  maxRedeemPerUser: number;
  createdAt: Date;
}

const ShopItemSchema = new Schema<IShopItem>({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: "" },
  maxRedeemPerUser: { type: Number, default: 1, min: 1 },
  createdAt: { type: Date, default: Date.now },
});

const ShopItem: Model<IShopItem> =
  mongoose.models.ShopItem || mongoose.model<IShopItem>("ShopItem", ShopItemSchema);

export default ShopItem;
