import productModel from "../../model/productModel";

export type CatalogModel = {
  name: string;
  image: string;
  price: number;
};

export type ResolvedLine = {
  size?: string;
  model?: string;
  unitPrice: number;
  image?: string;
};

export type ResolveResult =
  { ok: true; line: ResolvedLine } | { ok: false; message: string };

type PurchaseProduct = {
  price?: unknown;
  sizes?: unknown;
  models?: unknown;
  name?: unknown;
};

export type PricedOrderItem = {
  productId: string;
  quantity: number;
  size?: string;
  model?: string;
  price: number;
  name: string;
};

export function trimToAbsent(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function storedSizes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0
  );
}

export function readModels(value: unknown): CatalogModel[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name : "";
    const image = typeof record.image === "string" ? record.image : "";
    const price = record.price;
    if (!name || typeof price !== "number" || Number.isNaN(price)) return [];
    return [{ name, image, price }];
  });
}

export function resolvePurchaseLine(
  product: PurchaseProduct,
  input: { size?: unknown; model?: unknown }
): ResolveResult {
  const sizes = storedSizes(product.sizes);
  const models = readModels(product.models);
  const size = trimToAbsent(input.size);
  const model = trimToAbsent(input.model);

  let matchedSize: string | undefined;
  if (sizes.length > 0) {
    if (!size) return { ok: false, message: "Tamanho é obrigatório" };
    if (!sizes.includes(size))
      return { ok: false, message: "Tamanho inválido" };
    matchedSize = size;
  } else if (size) {
    return { ok: false, message: "Tamanho inválido" };
  }

  if (models.length > 0) {
    if (!model) return { ok: false, message: "Modelo é obrigatório" };
    const match = models.find((item) => item.name === model);
    if (!match) return { ok: false, message: "Modelo inválido" };
    return {
      ok: true,
      line: {
        size: matchedSize,
        model: match.name,
        unitPrice: match.price,
        image: match.image || undefined,
      },
    };
  }

  if (model) return { ok: false, message: "Modelo inválido" };

  if (typeof product.price !== "number" || Number.isNaN(product.price)) {
    return { ok: false, message: "Preço inválido" };
  }

  return {
    ok: true,
    line: {
      size: matchedSize,
      unitPrice: product.price,
    },
  };
}

export function sameCartLine(
  item: { productId?: unknown; size?: unknown; model?: unknown },
  target: { productId?: unknown; size?: unknown; model?: unknown }
): boolean {
  return (
    String(item.productId ?? "") === String(target.productId ?? "") &&
    trimToAbsent(item.size) === trimToAbsent(target.size) &&
    trimToAbsent(item.model) === trimToAbsent(target.model)
  );
}

export async function priceOrderItems(
  items: {
    productId: string;
    quantity: number;
    size?: string;
    model?: string;
  }[]
): Promise<
  | { ok: false; message: string }
  | { ok: true; orderItems: PricedOrderItem[]; total: number }
> {
  const orderItems: PricedOrderItem[] = [];
  let total = 0;

  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      return {
        ok: false,
        message: `Quantidade inválida para o produto ${item.productId}`,
      };
    }

    const product = await productModel.findById(item.productId);
    if (!product) {
      return {
        ok: false,
        message: `Produto não encontrado: ${item.productId}`,
      };
    }

    const resolved = resolvePurchaseLine(product, {
      size: item.size,
      model: item.model,
    });
    if (!resolved.ok) return resolved;

    total += resolved.line.unitPrice * item.quantity;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      size: resolved.line.size,
      model: resolved.line.model,
      price: resolved.line.unitPrice,
      name: typeof product.name === "string" ? product.name : item.productId,
    });
  }

  return { ok: true, orderItems, total };
}
