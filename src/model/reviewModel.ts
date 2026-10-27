import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  message: string;
  platform: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'product', required: true },
  message: { type: String, required: true },
  platform: { type: String, required: true },
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'video'] }
}, {
  timestamps: true
});

const reviewModel = mongoose.models.review || mongoose.model<IReview>('review', reviewSchema);

export default reviewModel;
