import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  name: string;
  price: number; // keep numeric in state
  qty: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const findItem = (state: CartState, productId: string) =>
  state.items.find((i) => i.productId === productId);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Replace entire cart from server payload */
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      // normalize price to number just in case server sends string
      state.items = (action.payload ?? []).map((it) => ({
        ...it,
        price: Number(it.price),
      }));
    },

    /** Add with explicit qty (existing: qty += payload.qty) */
    addItem: (state, action: PayloadAction<CartItem>) => {
      const { productId, name, price, qty } = action.payload;
      const existing = findItem(state, productId);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({
          productId,
          name,
          price: Number(price),
          qty,
        });
      }
    },

    /** Remove the entire line */
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },

    /** Set absolute qty for an item (0 removes it) */
    setItemQty: (
      state,
      action: PayloadAction<{ productId: string; qty: number }>
    ) => {
      const { productId, qty } = action.payload;
      const item = findItem(state, productId);
      if (!item) return;
      if (qty <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
      } else {
        item.qty = qty;
      }
    },

    /** Your original name kept for backwards compatibility */
    updateQty: (
      state,
      action: PayloadAction<{ productId: string; qty: number }>
    ) => {
      const { productId, qty } = action.payload;
      const item = findItem(state, productId);
      if (!item) return;
      if (qty <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
      } else {
        item.qty = qty;
      }
    },

    /** +1 local increment */
    incrementItem: (state, action: PayloadAction<string>) => {
      const item = findItem(state, action.payload);
      if (item) item.qty += 1;
    },

    /** -1 local decrement (removes if hits 0) */
    decrementItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const item = findItem(state, productId);
      if (!item) return;
      item.qty -= 1;
      if (item.qty <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
      }
    },

    /** Add/remove by delta; creates line if needed (for +delta) */
    upsertDelta: (
      state,
      action: PayloadAction<{
        productId: string;
        name: string;
        price: number | string;
        delta: number;
      }>
    ) => {
      const { productId, name, price, delta } = action.payload;
      const item = findItem(state, productId);
      if (!item) {
        if (delta > 0) {
          state.items.push({
            productId,
            name,
            price: Number(price),
            qty: delta,
          });
        }
        return;
      }
      item.qty += delta;
      if (item.qty <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  setCart,
  addItem,
  removeItem,
  setItemQty,
  updateQty, // kept for compatibility
  incrementItem,
  decrementItem,
  upsertDelta,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

/** Optional helpers/selectors */
export const selectCartItems = (s: any): CartItem[] => s.cart?.items ?? [];
export const selectQtyById = (id: string) => (s: any) =>
  (s.cart?.items ?? []).find((i: CartItem) => i.productId === id)?.qty ?? 0;
export const selectCount = (s: any) =>
  (s.cart?.items ?? []).reduce((sum: number, i: CartItem) => sum + i.qty, 0);
export const selectSubtotal = (s: any) =>
  (s.cart?.items ?? []).reduce(
    (sum: number, i: CartItem) => sum + i.qty * Number(i.price),
    0
  );
