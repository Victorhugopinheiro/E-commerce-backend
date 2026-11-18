import mongoose from "mongoose";
import productModel from "../../model/productModel";
import reviewModel from "../../model/reviewModel";

interface ReviewProps {
  productId: string;
  message: string;
  platform: string;
  userName: string;
  date: number;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  userImage?: string;
}

export class CreateReviewError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

class CreateReviewService {
  async execute({
    productId,
    message,
    platform,
    userName,
    date,
    mediaUrl,
    mediaType,
    userImage,
  }: ReviewProps) {
    const missing: string[] = [];
    if (!productId?.trim()) missing.push("produto");
    if (!message?.trim()) missing.push("mensagem");
    if (!platform?.trim()) missing.push("plataforma");
    if (!userName?.trim()) missing.push("nome do usuário");

    if (missing.length > 0) {
      throw new CreateReviewError(`Preencha os campos: ${missing.join(", ")}`);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new CreateReviewError("Id do produto inválido");
    }

    const productExists = await productModel.findById(productId);
    if (!productExists) {
      throw new CreateReviewError("Produto não encontrado", 404);
    }

    try {
      const newReview = new reviewModel({
        productId,
        message: message.trim(),
        platform: platform.trim(),
        userName: userName.trim(),
        date,
        mediaUrl,
        mediaType,
        userImage: userImage?.trim() || undefined,
      });
      await newReview.save();

      return { success: true, message: "Avaliação adicionada com sucesso" };
    } catch (err) {
      if (err instanceof CreateReviewError) {
        throw err;
      }
      console.error("Error saving review:", err);
      throw new CreateReviewError("Erro ao adicionar avaliação", 500);
    }
  }
}

export default CreateReviewService;
