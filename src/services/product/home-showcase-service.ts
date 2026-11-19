import productModel from "../../model/productModel";

const SHOWCASE_LIMIT = 8;

export interface ShowcaseItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

export interface HomeShowcase {
  bestsellers: ShowcaseItem[];
  gtaVi: ShowcaseItem[];
  marvel: ShowcaseItem[];
  dc: ShowcaseItem[];
}

type LeanShowcaseProduct = {
  _id: unknown;
  name?: unknown;
  price?: unknown;
  image?: unknown;
  models?: unknown;
};

function cardFromModels(
  models: unknown
): { price: number; image?: string } | null {
  if (!Array.isArray(models) || models.length === 0) return null;

  const prices: number[] = [];
  let firstImage: string | undefined;
  models.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const record = entry as Record<string, unknown>;
    if (
      index === 0 &&
      typeof record.image === "string" &&
      record.image.length > 0
    ) {
      firstImage = record.image;
    }
    if (typeof record.price === "number" && !Number.isNaN(record.price)) {
      prices.push(record.price);
    }
  });

  if (prices.length === 0) return null;
  return {
    price: Math.min(...prices),
    image: firstImage,
  };
}

function coverFromGallery(image: unknown): {
  present: boolean;
  image?: string;
} {
  if (!Array.isArray(image) || image.length === 0) {
    return { present: false };
  }
  const first = image[0];
  if (typeof first === "string" && first.length > 0) {
    return { present: true, image: first };
  }
  return { present: true };
}

function toShowcaseItem(product: LeanShowcaseProduct): ShowcaseItem | null {
  const id = product._id == null ? "" : String(product._id);
  if (!id || typeof product.name !== "string" || product.name.length === 0) {
    return null;
  }

  const fromModels = cardFromModels(product.models);
  if (fromModels) {
    const gallery = coverFromGallery(product.image);
    const cover = gallery.present ? gallery.image : fromModels.image;
    const item: ShowcaseItem = {
      _id: id,
      name: product.name,
      price: fromModels.price,
    };
    if (cover) item.image = cover;
    return item;
  }
  if (Array.isArray(product.models) && product.models.length > 0) {
    return null;
  }

  if (typeof product.price !== "number" || Number.isNaN(product.price)) {
    return null;
  }

  const item: ShowcaseItem = {
    _id: id,
    name: product.name,
    price: product.price,
  };

  if (Array.isArray(product.image)) {
    const firstImage = product.image[0];
    if (typeof firstImage === "string" && firstImage.length > 0) {
      item.image = firstImage;
    }
  }

  return item;
}

class HomeShowcaseService {
  async execute(): Promise<HomeShowcase> {
    const [bestsellers, gtaVi, marvel, dc] = await Promise.all([
      this.list({ bestseller: true }),
      this.list({ franchise: { $in: ["GTA VI", "GTAVI"] } }),
      this.list({ franchise: "Marvel" }),
      this.list({ franchise: "DC" }),
    ]);

    return { bestsellers, gtaVi, marvel, dc };
  }

  private async list(filter: Record<string, unknown>): Promise<ShowcaseItem[]> {
    const products = await productModel
      .find({
        ...filter,
        name: { $type: "string", $ne: "" },
        $or: [
          { price: { $type: "number" } },
          { "models.price": { $type: "number" } },
        ],
      })
      .sort({ date: -1, _id: 1 })
      .limit(SHOWCASE_LIMIT)
      .select("name price image models")
      .lean<LeanShowcaseProduct[]>();

    return products.flatMap((product) => {
      const item = toShowcaseItem(product);
      return item ? [item] : [];
    });
  }
}

export default HomeShowcaseService;
