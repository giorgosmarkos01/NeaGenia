"use client";

import { createContext, useContext } from "react";
import type { Discount } from "@/types/discount";

const DiscountsContext = createContext<Discount[]>([]);

export function DiscountsProvider({
  discounts,
  children,
}: {
  discounts: Discount[];
  children: React.ReactNode;
}) {
  return (
    <DiscountsContext.Provider value={discounts}>
      {children}
    </DiscountsContext.Provider>
  );
}

export function useDiscounts() {
  return useContext(DiscountsContext);
}
