import mongoose from "mongoose";

const franchiseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
});

const franchiseModel =
  mongoose.models.franchise || mongoose.model("franchise", franchiseSchema);

export default franchiseModel;
