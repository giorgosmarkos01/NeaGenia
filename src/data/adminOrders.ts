import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import type { PaymentStatus } from "@/lib/orderStatus";

export type AdminOrderListItem = {
  orderId: string;
  customerName: string;
  email: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  orderType: "receipt" | "invoice";
  orderDate: string;
};

export type AdminOrderDetail = {
  orderId: string;
  userId: string | null;
  customerName: string;
  email: string;
  phoneNumber: string;
  orderDate: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  orderType: "receipt" | "invoice";
  couponCode: string | null;
  orderCode: string | null;
  items: {
    orderItemId: string;
    itemName: string;
    itemProductCode: string | null;
    itemVariationName: string | null;
    quantity: number;
    price: string;
    totalPrice: string;
  }[];
  delivery: {
    addressLine: string | null;
    city: string | null;
    province: string | null;
    zip: string | null;
    country: string | null;
    shippingOption: "ELTA" | "FedEx" | "BoxNow" | null;
    cost: string | null;
    boxNowLockerId: string | null;
    boxNowLockerAddressLine1: string | null;
  } | null;
  invoice: {
    companyName: string;
    companyAddress: string;
    companyCity: string;
    companyZip: string;
    vatNumber: string;
    occupation: string;
    taxOffice: string;
  } | null;
};

export async function listAdminOrders(
  statusFilter?: PaymentStatus
): Promise<AdminOrderListItem[]> {
  const where = statusFilter ? `WHERE o.payment_status = ?` : "";
  const params = statusFilter ? [statusFilter] : [];

  return queryRows<AdminOrderListItem & RowDataPacket>(
    `
    SELECT
      o.order_id AS orderId,
      o.customer_name AS customerName,
      o.email,
      o.total_amount AS totalAmount,
      o.payment_status AS paymentStatus,
      o.order_type AS orderType,
      o.order_date AS orderDate
    FROM orders o
    ${where}
    ORDER BY o.order_date DESC
    LIMIT 200
    `,
    params
  );
}

export async function getAdminOrderById(
  orderId: string
): Promise<AdminOrderDetail | null> {
  const [order] = await queryRows<AdminOrderDetail & RowDataPacket>(
    `
    SELECT
      o.order_id AS orderId,
      o.user_id AS userId,
      o.customer_name AS customerName,
      o.email,
      o.phone_number AS phoneNumber,
      o.order_date AS orderDate,
      o.total_amount AS totalAmount,
      o.payment_status AS paymentStatus,
      o.order_type AS orderType,
      o.coupon_code AS couponCode,
      o.orderCode
    FROM orders o
    WHERE o.order_id = ?
    LIMIT 1
    `,
    [orderId]
  );
  if (!order) return null;

  const items = await queryRows<AdminOrderDetail["items"][number] & RowDataPacket>(
    `
    SELECT
      order_item_id AS orderItemId,
      item_name AS itemName,
      item_product_code AS itemProductCode,
      item_variation_name AS itemVariationName,
      quantity,
      price,
      total_price AS totalPrice
    FROM order_items
    WHERE order_id = ?
    `,
    [orderId]
  );

  const [delivery] = await queryRows<
    NonNullable<AdminOrderDetail["delivery"]> & RowDataPacket
  >(
    `
    SELECT
      address_line AS addressLine, city, province, zip, country,
      shipping_option AS shippingOption, cost,
      box_now_locker_id AS boxNowLockerId,
      box_now_locker_address_line1 AS boxNowLockerAddressLine1
    FROM delivery_details
    WHERE order_id = ?
    LIMIT 1
    `,
    [orderId]
  );

  const [invoice] = await queryRows<
    NonNullable<AdminOrderDetail["invoice"]> & RowDataPacket
  >(
    `
    SELECT
      company_name AS companyName, company_address AS companyAddress,
      company_city AS companyCity, company_zip AS companyZip,
      vat_number AS vatNumber, occupation, tax_office AS taxOffice
    FROM invoice_details
    WHERE order_id = ?
    LIMIT 1
    `,
    [orderId]
  );

  return {
    ...order,
    items,
    delivery: delivery ?? null,
    invoice: invoice ?? null,
  };
}
