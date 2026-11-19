import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
  image: {
    type: Array,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  sizes: {
    type: Array,
    required: false,
  },
  models: {
    type: [
      new mongoose.Schema(
        {
          name: { type: String, required: true },
          image: { type: String, required: true },
          price: { type: Number, required: true },
        },
        { _id: false }
      ),
    ],
    required: false,
    default: undefined,
  },
  bestseller: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Number,
    required: true,
  },
  reviews: {
    type: Array,
    default: [],
  },
  franchise: {
    type: String,
    required: false,
  },
  characteristics: {
    type: Array,
    required: false,
  },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;
