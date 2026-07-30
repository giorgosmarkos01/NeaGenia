import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [[{ count }]]: any = await db.query(
    `SELECT COUNT(*) AS count FROM item WHERE collaborator_id = ?`,
    [id]
  );
  if (count > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${count} product${count === 1 ? "" : "s"} still ${
          count === 1 ? "uses" : "use"
        } this collaborator.`,
      },
      { status: 409 }
    );
  }

  const [result]: any = await db.query(`DELETE FROM collaborator WHERE id = ?`, [id]);
  if (result.affectedRows === 0) {
    return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
