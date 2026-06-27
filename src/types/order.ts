export interface CreateOrderRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    size?: string;
    price?: number;
    name?: string;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    number: string;
    phone?: string;
    ibgeCode: string;
  };
  paymentMethod: string;
  origin?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}