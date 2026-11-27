import mongoose, { Model } from "mongoose";

interface IAsaasProcessedWebhook extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  eventId: string;
}

const asaasProcessedWebhooksSchema =
  new mongoose.Schema<IAsaasProcessedWebhook>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String },
    eventId: { type: String, required: true, unique: true },
  });

const asaasProcessedWebhooksModel: Model<IAsaasProcessedWebhook> =
  mongoose.models.AsaasProcessedWebhook ||
  mongoose.model<IAsaasProcessedWebhook>(
    "AsaasProcessedWebhook",
    asaasProcessedWebhooksSchema
  );

export default asaasProcessedWebhooksModel;
