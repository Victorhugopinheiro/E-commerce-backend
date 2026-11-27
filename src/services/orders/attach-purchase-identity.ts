import purchaseIdentityModel from "../../model/purchaseIdentityModel";

type OrderLike = { _id: unknown; toObject?: () => Record<string, unknown> };

export type PurchaseIdentityView = {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
};

export async function attachPurchaseIdentities<T extends OrderLike>(
  orders: T[]
) {
  const identities = await purchaseIdentityModel.find({
    orderId: { $in: orders.map((order) => order._id) },
  });

  const byOrder = new Map<string, PurchaseIdentityView>();
  for (const identity of identities) {
    byOrder.set(String(identity.orderId), {
      fullName: identity.fullName,
      email: identity.email,
      cpf: identity.cpf,
      phone: identity.phone,
    });
  }

  return orders.map((order) => {
    const plain =
      typeof order.toObject === "function" ? order.toObject() : { ...order };
    return {
      ...plain,
      identity: byOrder.get(String(order._id)) ?? null,
    };
  });
}
