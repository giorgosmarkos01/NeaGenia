import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type WishlistState = string[]; // π.χ. ["abc123", "xyz789"]

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: [] as WishlistState,
  reducers: {
    setWishlist: (_, action: PayloadAction<string[]>) => {
      return action.payload;
    },

    addToWishlist: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) {
        state.push(action.payload);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      return state.filter((id) => id !== action.payload);
    },

    clearWishlist: () => {
      return [];
    },
  },
});

export const { setWishlist, addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
