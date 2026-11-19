import { Request, Response } from "express";
import { cloudinary } from "../../config/cloudinary";
import AddProductService, {
  AddProductError,
  ProductCharacteristic,
  ProductModelInput,
} from "../../services/product/add-product-service";

function parseCharacteristics(value: unknown): ProductCharacteristic[] {
  let raw: unknown = value;

  if (typeof value === "string") {
    if (!value.trim()) return [];
    try {
      raw = JSON.parse(value);
    } catch {
      throw new AddProductError("Características inválidas");
    }
  }

  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new AddProductError("Características inválidas");
  }

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const description =
      typeof record.description === "string" ? record.description.trim() : "";
    if (!title || !description) return [];
    return [{ title, description }];
  });
}

function parseModelDrafts(value: unknown): { name: string; price: number }[] {
  if (value == null) return [];
  if (typeof value === "string" && !value.trim()) return [];

  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      throw new AddProductError("Modelos inválidos");
    }
  }

  if (!Array.isArray(raw)) {
    throw new AddProductError("Modelos inválidos");
  }

  return raw.map((item) => {
    if (!item || typeof item !== "object") {
      throw new AddProductError("Modelos inválidos");
    }
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const price =
      typeof record.price === "number"
        ? record.price
        : parseFloat(String(record.price));
    if (!name) {
      throw new AddProductError("Modelo sem nome");
    }
    if (Number.isNaN(price)) {
      throw new AddProductError("Preço do modelo inválido");
    }
    return { name, price };
  });
}

function readProductPrice(value: unknown): {
  provided: boolean;
  price?: number;
} {
  if (value == null) return { provided: false };
  if (typeof value === "string" && value.trim() === "") {
    return { provided: false };
  }
  const price = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(price)) {
    throw new AddProductError("Preço inválido");
  }
  return { provided: true, price };
}

function filesFrom(
  files: Request["files"],
  field: string
): Express.Multer.File[] {
  if (!files || Array.isArray(files)) return [];
  const selected = files[field];
  return Array.isArray(selected) ? selected : [];
}

async function uploadImages(files: Express.Multer.File[]): Promise<string[]> {
  return Promise.all(
    files.map(async (img) => {
      const result = await cloudinary.uploader.upload(img.path, {
        resource_type: "image",
      });
      return result.secure_url;
    })
  );
}

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
        characteristics,
        models,
      } = req.body;

      const galleryFiles = [
        ...filesFrom(req.files, "image1"),
        ...filesFrom(req.files, "image2"),
        ...filesFrom(req.files, "image3"),
        ...filesFrom(req.files, "image4"),
      ];
      const modelFiles = filesFrom(req.files, "modelImages");
      const drafts = parseModelDrafts(models);
      const productPrice = readProductPrice(price);

      if (drafts.length > 0) {
        if (modelFiles.length !== drafts.length) {
          throw new AddProductError("Cada modelo precisa de uma foto");
        }
        if (productPrice.provided) {
          throw new AddProductError("Produto com modelos não pode ter preço");
        }
      } else if (modelFiles.length > 0) {
        throw new AddProductError("Cada modelo precisa de uma foto");
      }

      const imagesUrl = await uploadImages(galleryFiles);
      const modelImages =
        drafts.length > 0 ? await uploadImages(modelFiles) : [];
      const parsedModels: ProductModelInput[] = drafts.map((draft, index) => ({
        name: draft.name,
        price: draft.price,
        image: modelImages[index],
      }));

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
      const parsedCharacteristics = parseCharacteristics(characteristics);

      const newProductService = new AddProductService();
      await newProductService.execute({
        name,
        description,
        price: productPrice.price,
        productPriceProvided: productPrice.provided,
        category,
        subCategory,
        sizes: parsedSizes,
        bestseller: isBestseller,
        image: imagesUrl,
        date: Date.now(),
        franchise,
        characteristics: parsedCharacteristics,
        models: parsedModels,
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
