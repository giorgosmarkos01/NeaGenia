import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  weight?: number;
  imageUrl?: string | null;
  subtotal?: number;
  effectivePrice?: number;
  effectiveLineTotal?: number;
  discounted?: boolean;
}

interface CartState {
  items: CartItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
  lastSyncedAt?: number;
}

const initialState: CartState = {
  items: [],
  status: "idle",
  error: null,
};

// ---- tiny fetch helper (always JSON, throws on !ok) ----
async function fetchJSON<T>(
  url: string,
  init?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// ================== THUNKS (no optimistic UI) ==================
type ItemsPayload = { items: CartItem[] };

export const fetchCart = createAsyncThunk<
  ItemsPayload,
  void,
  { rejectValue: string }
>("cart/fetchCart", async (_, { signal, rejectWithValue }) => {
  try {
    // NOTE: use /api/cart/items to match your components
    return await fetchJSON<ItemsPayload>("/api/cart/items", {
      method: "GET",
      signal,
    });
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Failed to fetch cart");
  }
});

export const setItemAbs = createAsyncThunk<
  ItemsPayload,
  { productId: string; qty: number; price?: number; variantIds?: number[] },
  { rejectValue: string }
>("cart/setItemAbs", async (body, { signal, rejectWithValue }) => {
  try {
    return await fetchJSON<ItemsPayload>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ ...body, abs: true }),
      signal,
    });
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Failed to update item");
  }
});

export const addDelta = createAsyncThunk<
  ItemsPayload,
  { productId: string; delta: number; price?: number; variantIds?: number[] },
  { rejectValue: string }
>(
  "cart/addDelta",
  async ({ productId, delta, price, variantIds }, { signal, rejectWithValue }) => {
    try {
      return await fetchJSON<ItemsPayload>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, qty: delta, price, variantIds }),
        signal,
      });
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to change quantity");
    }
  }
);

export const removeItem = createAsyncThunk<
  ItemsPayload,
  { productId: string },
  { rejectValue: string }
>("cart/removeItem", async ({ productId }, { signal, rejectWithValue }) => {
  try {
    return await fetchJSON<ItemsPayload>("/api/cart/items", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
      signal,
    });
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Failed to remove item");
  }
});

// ================== SLICE ==================
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.lastSyncedAt = Date.now();
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = (action.payload ?? []).map((it) => ({
        ...it,
        price: Number(it.price),
        effectivePrice: Number(it.effectivePrice ?? it.price),
      }));
      state.status = "succeeded";
      state.error = null;
      state.lastSyncedAt = Date.now();
    },
  },
  extraReducers: (b) => {
    const onPending = (s: CartState) => {
      s.status = "loading";
      s.error = null;
    };
    const onFulfilled = (s: CartState, a: PayloadAction<ItemsPayload>) => {
      s.items = (a.payload.items ?? []).map((it) => ({
        ...it,
        price: Number(it.price),
        effectivePrice: Number(it.effectivePrice ?? it.price),
      }));
      s.status = "succeeded";
      s.error = null;
      s.lastSyncedAt = Date.now();
    };
    const onRejected = (s: CartState, a: any) => {
      s.status = "failed";
      s.error = a?.payload || a?.error?.message || "Request failed";
    };

    b.addCase(fetchCart.pending, onPending)
      .addCase(fetchCart.fulfilled, onFulfilled)
      .addCase(fetchCart.rejected, onRejected)
      .addCase(setItemAbs.pending, onPending)
      .addCase(setItemAbs.fulfilled, onFulfilled)
      .addCase(setItemAbs.rejected, onRejected)
      .addCase(addDelta.pending, onPending)
      .addCase(addDelta.fulfilled, onFulfilled)
      .addCase(addDelta.rejected, onRejected)
      .addCase(removeItem.pending, onPending)
      .addCase(removeItem.fulfilled, onFulfilled)
      .addCase(removeItem.rejected, onRejected);
  },
});

export const { clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;

// ================== SELECTORS ==================
export const selectCartState = (s: any): CartState => s.cart ?? initialState;
export const selectCartItems = (s: any): CartItem[] => selectCartState(s).items;
export const selectCartStatus = (s: any) => selectCartState(s).status;
export const selectCartError = (s: any) => selectCartState(s).error;

export const selectQtyById =
  (id: string) => (s: any) =>
    selectCartItems(s).find((i) => i.productId === id)?.qty ?? 0;

export const selectCount = (s: any) =>
  selectCartItems(s).reduce((sum, i) => sum + i.qty, 0);

export const selectSubtotal = (s: any) =>
  selectCartItems(s).reduce(
    (sum, i) =>
      sum +
      (typeof i.subtotal === "number" ? i.subtotal : i.qty * Number(i.price)),
    0
  );

/** Subtotal after active auto-discounts (what the customer actually pays before shipping/coupons). */
export const selectDiscountedSubtotal = (s: any) =>
  selectCartItems(s).reduce(
    (sum, i) =>
      sum +
      (typeof i.effectiveLineTotal === "number"
        ? i.effectiveLineTotal
        : i.qty * Number(i.effectivePrice ?? i.price)),
    0
  );
