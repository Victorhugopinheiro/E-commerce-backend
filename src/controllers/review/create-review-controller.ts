import { Request, Response } from "express";
import { cloudinary } from "../../config/cloudinary";
import CreateReviewService, {
  CreateReviewError,
} from "../../services/review/create-review-service";

class CreateReviewController {
  async handle(req: Request, res: Response) {
    try {
      const { productId, message, platform, userName, userImage } = req.body;

      const mediaFile =
        req.files && (req.files as any).media
          ? (req.files as any).media[0]
          : null;
      const userImageFile =
        req.files && (req.files as any).userImage
          ? (req.files as any).userImage[0]
          : null;

      let mediaUrl: string | undefined;
      let mediaType: "image" | "video" | undefined;

      if (mediaFile) {
        mediaType = mediaFile.mimetype.startsWith("video") ? "video" : "image";
        const result = await cloudinary.uploader.upload(mediaFile.path, {
          resource_type: mediaType,
        });
        mediaUrl = result.secure_url;
      }

      let userImageUrl: string | undefined;
      if (userImageFile) {
        const result = await cloudinary.uploader.upload(userImageFile.path, {
          resource_type: "image",
        });
        userImageUrl = result.secure_url;
      } else if (typeof userImage === "string" && userImage.trim()) {
        userImageUrl = userImage.trim();
      }

      const newReviewService = new CreateReviewService();
      await newReviewService.execute({
        productId,
        message,
        platform,
        userName,
        mediaUrl,
        mediaType,
        userImage: userImageUrl,
        date: Date.now(),
      });

      res.json({ success: true, message: "Avaliação adicionada com sucesso" });
    } catch (error) {
      console.error("Error adding review:", error);
      if (error instanceof CreateReviewError) {
        return res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      }
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro interno ao adicionar avaliação",
        });
    }
  }
}

export default CreateReviewController;
