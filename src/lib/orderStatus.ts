export const PAYMENT_STATUSES = ["pending", "completed", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
