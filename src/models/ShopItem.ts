import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShopItem extends Document {
  name: string;
  cost: number;
  quantity: number;
  createdAt: Date;
}

const ShopItemSchema = new Schema<IShopItem>({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

const ShopItem: Model<IShopItem> =
  mongoose.models.ShopItem || mongoose.model<IShopItem>("ShopItem", ShopItemSchema);

export default ShopItem;
