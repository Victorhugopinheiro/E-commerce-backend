import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  size?: string;
  model?: string;
  price: number;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  items: IOrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    street: string;
    number?: string;
    neighborhood?: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    ibgeCode?: string;
    phone?: string;
  };
  shipping?: {
    serviceId: string;
    serviceName: string;
    price: number;
    deadline: number;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  checkoutUrl?: string;
  checkoutId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String },
  model: { type: String },
  price: { type: Number, min: 0 },
});

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: { type: String, required: true },
      number: { type: String },
      neighborhood: { type: String },
      complement: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      ibgeCode: { type: String },
      phone: { type: String },
    },
    shipping: {
      serviceId: { type: String },
      serviceName: { type: String },
      price: { type: Number, min: 0 },
      deadline: { type: Number, min: 0 },
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    date: { type: Number, required: true },
    checkoutUrl: { type: String },
    checkoutId: { type: String },
    checkoutStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const orderModel =
  mongoose.models.order || mongoose.model<IOrder>("order", OrderSchema);

export default orderModel;
