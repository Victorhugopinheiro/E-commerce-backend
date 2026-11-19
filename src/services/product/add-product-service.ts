import franchiseModel from "../../model/franchiseModel";
import productModel from "../../model/productModel";

export type ProductCharacteristic = {
  title: string;
  description: string;
};

export type ProductModelInput = {
  name: string;
  image: string;
  price: number;
};

interface ProductProps {
  name: string;
  description: string;
  price?: number;
  category: string;
  subCategory?: string;
  sizes: string[];
  bestseller: boolean;
  image: string[];
  date: number;
  franchise?: string;
  characteristics?: ProductCharacteristic[];
  models?: ProductModelInput[];
  productPriceProvided?: boolean;
}

export class AddProductError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function normalizeModels(models: ProductModelInput[]): ProductModelInput[] {
  const seen = new Set<string>();

  return models.map((model) => {
    const name = model.name?.trim() ?? "";
    if (!name) {
      throw new AddProductError("Modelo sem nome");
    }
    if (seen.has(name)) {
      throw new AddProductError("Modelo repetido");
    }
    seen.add(name);

    if (!model.image) {
      throw new AddProductError("Cada modelo precisa de uma foto");
    }
    if (
      typeof model.price !== "number" ||
      Number.isNaN(model.price) ||
      !model.price
    ) {
      throw new AddProductError("Preço do modelo inválido");
    }

    return { name, image: model.image, price: model.price };
  });
}

class AddProductService {
  async execute({
    name,
    description,
    price,
    category,
    subCategory,
    sizes,
    bestseller,
    image,
    date,
    franchise,
    characteristics,
    models,
    productPriceProvided,
  }: ProductProps) {
    const normalizedModels =
      models && models.length > 0 ? normalizeModels(models) : [];
    const hasModels = normalizedModels.length > 0;
    const gallery = image ?? [];
    const normalizedSizes = (sizes ?? [])
      .map((size) => (typeof size === "string" ? size.trim() : ""))
      .filter((size) => size.length > 0);

    const missing: string[] = [];
    if (!name?.trim()) missing.push("nome");
    if (!description?.trim()) missing.push("descrição");
    if (!category?.trim()) missing.push("categoria");

    if (hasModels) {
      if (productPriceProvided || gallery.length > 0) {
        throw new AddProductError(
          "Produto com modelos não pode ter preço nem galeria"
        );
      }
    } else {
      if (price === undefined || Number.isNaN(price) || !price) {
        missing.push("preço");
      }
      if (normalizedSizes.length === 0) missing.push("tamanhos");
      if (gallery.length === 0) missing.push("imagem");
    }

    if (missing.length > 0) {
      throw new AddProductError(`Preencha os campos: ${missing.join(", ")}`);
    }

    const trimmedFranchise = franchise?.trim();
    if (trimmedFranchise) {
      const franchiseExists = await franchiseModel.findOne({
        type: trimmedFranchise,
      });
      if (!franchiseExists) {
        throw new AddProductError("Franquia inválida");
      }
    }

    try {
      const product: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        subCategory: subCategory?.trim() || undefined,
        sizes: normalizedSizes,
        bestseller: bestseller || false,
        date,
        franchise: trimmedFranchise || undefined,
        characteristics: characteristics ?? [],
      };

      if (hasModels) {
        product.models = normalizedModels;
      } else {
        product.price = price;
        product.image = gallery;
      }

      const newProduct = new productModel(product);
      await newProduct.save();

      return { success: true, message: "Produto adicionado com sucesso" };
    } catch (err) {
      if (err instanceof AddProductError) {
        throw err;
      }
      console.error("Error saving product:", err);
      throw new AddProductError("Erro ao adicionar produto", 500);
    }
  }
}

export default AddProductService;
