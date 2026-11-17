import { Request, Response } from "express";
import { cloudinary } from "../../config/cloudinary";
import AddProductService, {
  AddProductError,
} from "../../services/product/add-product-service";

class AddProductController {
  async handle(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        price,
        category,
        subCategory,
        sizes,
        bestseller,
        bestSellers,
        franchise,
      } = req.body;

      const image1 =
        req.files && (req.files as any).image1
          ? (req.files as any).image1[0]
          : null;
      const image2 =
        req.files && (req.files as any).image2
          ? (req.files as any).image2[0]
          : null;
      const image3 =
        req.files && (req.files as any).image3
          ? (req.files as any).image3[0]
          : null;
      const image4 =
        req.files && (req.files as any).image4
          ? (req.files as any).image4[0]
          : null;

      const images = [image1, image2, image3, image4].filter(
        (img) => img !== null
      );

      let imagesUrl = await Promise.all(
        images.map(async (img) => {
          let result = await cloudinary.uploader.upload(img.path, {
            resource_type: "image",
          });

          return result.secure_url;
        })
      );

      let parsedSizes: string[] = [];
      if (Array.isArray(sizes)) {
        parsedSizes = sizes;
      } else if (typeof sizes === "string" && sizes.length > 0) {
        parsedSizes = JSON.parse(sizes);
        if (!Array.isArray(parsedSizes)) {
          throw new AddProductError("Tamanhos inválidos");
        }
      }

      const isBestseller = bestseller === "true" || bestSellers === "true";

      const newProductService = new AddProductService();
      await newProductService.execute({
        name,
        description,
        price: parseFloat(price),
        category,
        subCategory,
        sizes: parsedSizes,
        bestseller: isBestseller,
        image: imagesUrl,
        date: Date.now(),
        franchise,
      });

      res.json({ success: true, message: "Produto adicionado com sucesso" });
    } catch (error) {
      console.error("Error adding product:", error);
      if (error instanceof AddProductError) {
        return res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      }
      if (error instanceof SyntaxError) {
        return res
          .status(400)
          .json({ success: false, message: "Tamanhos inválidos" });
      }
      return res
        .status(500)
        .json({ success: false, message: "Erro interno ao adicionar produto" });
    }
  }
}

export default AddProductController;
