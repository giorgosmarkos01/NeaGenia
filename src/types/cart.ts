export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
};

export interface APICartItem {
  productId: string;
  name: string;
  price: string | number;
  qty: number;
  imageUrl?: string;
}

export interface CartAPIResponse {
  cartId: string | null;
  items: APICartItem[];
}
