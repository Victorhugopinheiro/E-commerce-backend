import CalculatingCepService from "./calculatingCepService";
import { ShippingOption } from "./pick-shipping-options";

const STORE_BOX = {
  width: 20,
  height: 20,
  length: 10,
  weight: 1,
};

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

function parseDeadline(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

export function parseShippingQuotes(data: unknown): ShippingOption[] {
  if (!Array.isArray(data)) return [];

  const options: ShippingOption[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.error === "string" && record.error.trim() !== "")
      continue;
    if (record.error && typeof record.error !== "string") continue;

    const price = parsePrice(record.price);
    const deadline = parseDeadline(record.delivery_time);
    if (
      price === null ||
      deadline === null ||
      record.id === undefined ||
      record.id === null
    ) {
      continue;
    }

    let carrier = "";
    if (record.company && typeof record.company === "object") {
      const name = (record.company as { name?: unknown }).name;
      if (typeof name === "string") carrier = name;
    }

    options.push({
      serviceId: String(record.id),
      carrier,
      serviceName: typeof record.name === "string" ? record.name : "",
      price,
      deadline,
    });
  }

  return options;
}

export async function quoteStoreBox(
  destinationCep: string,
  declaredValue: number
) {
  const calculatingCepService = new CalculatingCepService();
  const data = await calculatingCepService.execute(destinationCep, {
    ...STORE_BOX,
    value: declaredValue,
  });
  return parseShippingQuotes(data);
}
