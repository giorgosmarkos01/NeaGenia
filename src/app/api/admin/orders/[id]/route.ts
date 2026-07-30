import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/adminAuth";
import { PAYMENT_STATUSES } from "@/lib/orderStatus";

type Params = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
});

export async function PATCH(req: Request, { params }: Params) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid status" },
      { status: 400 }
    );
  }

  const [result]: any = await db.query(
    `UPDATE orders SET payment_status = ? WHERE order_id = ?`,
    [parsed.data.paymentStatus, id]
  );
  if (result.affectedRows === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
