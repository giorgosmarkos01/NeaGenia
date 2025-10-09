// DiscountProvidex.tsx
"use client";

import { createContext, useContext } from "react";
import type { Discount } from "@/types/discount";

const DiscountsContext = createContext<Discount[]>([]);

export function DiscountsProvider({
  discounts: _ignored,
  children,
}: {
  discounts: Discount[];
  children: React.ReactNode;
}) {
  // Force-disable always-on discounts for now
  return (
    <DiscountsContext.Provider value={[]}>
      {children}
    </DiscountsContext.Provider>
  );
}

export function useDiscounts() {
  return useContext(DiscountsContext);
}
