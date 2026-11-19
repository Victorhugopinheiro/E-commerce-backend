interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  model?: string;
  image?: string;
  name?: string;
  price?: number;
}

export default CartItem;
