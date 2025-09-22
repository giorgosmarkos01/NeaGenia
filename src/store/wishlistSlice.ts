import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  slug?: string;
  image?: string;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const findItem = (state: WishlistState, productId: string) =>
  state.items.find((i) => i.productId === productId);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    /** Αντικατάσταση όλης της wishlist */
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = (action.payload ?? []).map((it) => ({
        ...it,
        price: Number(it.price),
      }));
    },

    /** Προσθήκη (αν δεν υπάρχει ήδη) */
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = findItem(state, action.payload.productId);
      if (!exists) {
        state.items.push({
          ...action.payload,
          price: Number(action.payload.price),
        });
      }
    },

    /** Αφαίρεση */
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },

    /** Καθάρισμα */
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { setWishlist, addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
