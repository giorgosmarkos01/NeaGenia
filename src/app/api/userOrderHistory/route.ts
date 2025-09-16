// src/app/api/userOrderHistory/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [orders]: any = await db.query(
      `
      SELECT
        o.order_id,
        o.total_amount,
        o.order_date,
        o.payment_status,
        o.order_type,
        dd.address_line,
        dd.city,
        dd.zip,
        dd.country,
        dd.shipping_option,
        id.company_name,
        id.vat_number,
        id.tax_office
      FROM orders o
      LEFT JOIN delivery_details dd ON dd.order_id = o.order_id
      LEFT JOIN invoice_details id ON id.order_id = o.order_id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
      `,
      [userId]
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[userOrderHistory]", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}
