import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  message: string;
  platform: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  date: number;
  userName: string;
  userImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
    message: { type: String, required: true },
    platform: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    date: { type: Number, required: true },
    userName: { type: String, required: true },
    userImage: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const reviewModel =
  mongoose.models.review || mongoose.model<IReview>("review", reviewSchema);

export default reviewModel;
