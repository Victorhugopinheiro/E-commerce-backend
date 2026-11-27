export type ShippingOption = {
  serviceId: string;
  carrier: string;
  serviceName: string;
  price: number;
  deadline: number;
};

type RankedOption = ShippingOption & { index: number };

export function pickShippingOptions(
  quotes: ShippingOption[]
): ShippingOption[] {
  const ranked: RankedOption[] = quotes.map((quote, index) => ({
    ...quote,
    index,
  }));
  if (ranked.length === 0) return [];

  const cheapest = [...ranked].sort((left, right) => {
    if (left.price !== right.price) return left.price - right.price;
    if (left.deadline !== right.deadline) return left.deadline - right.deadline;
    return left.index - right.index;
  })[0];

  const fastest = [...ranked].sort((left, right) => {
    if (left.deadline !== right.deadline) return left.deadline - right.deadline;
    if (left.price !== right.price) return left.price - right.price;
    return left.index - right.index;
  })[0];

  const chosen =
    cheapest.serviceId === fastest.serviceId ? [cheapest] : [cheapest, fastest];

  return chosen.map(({ index: _index, ...option }) => option);
}
