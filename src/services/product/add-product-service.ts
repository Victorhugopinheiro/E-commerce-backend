import franchiseModel from "../../model/franchiseModel";
import productModel from "../../model/productModel";

interface ProductProps {
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  sizes: string[];
  bestseller: boolean;
  image: string[];
  date: number;
  franchise?: string;
}

export class AddProductError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
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
  }: ProductProps) {
    const missing: string[] = [];
    if (!name?.trim()) missing.push("nome");
    if (!description?.trim()) missing.push("descrição");
    if (!price || Number.isNaN(price)) missing.push("preço");
    if (!category?.trim()) missing.push("categoria");
    if (!sizes || sizes.length === 0) missing.push("tamanhos");
    if (!image || image.length === 0) missing.push("imagem");

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
      const product: ProductProps = {
        name: name.trim(),
        description: description.trim(),
        price,
        image,
        category: category.trim(),
        subCategory: subCategory?.trim() || undefined,
        sizes,
        bestseller: bestseller || false,
        date,
        franchise: trimmedFranchise || undefined,
      };

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
