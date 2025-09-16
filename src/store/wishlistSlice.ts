// store/wishlistSlice.ts

import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [] as string[], // product IDs only
  },
  reducers: {
    setWishlist(state, action) {
      state.items = action.payload;
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
