interface CartItem {
    productId: string;
    quantity: number;
    size?: string;
    image?: string;
    name?: string;
}

export default CartItem;