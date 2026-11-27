import mongoose from "mongoose";

const purchaseIdentitySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    guestId: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    cpf: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

const purchaseIdentityModel =
  mongoose.models.purchaseIdentity ||
  mongoose.model("purchaseIdentity", purchaseIdentitySchema);

export default purchaseIdentityModel;
