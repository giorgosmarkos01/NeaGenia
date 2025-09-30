import { CartItem } from "./cart";

export interface CartApiResponse {
  cartId: string | null;
  items: CartItem[];
}
