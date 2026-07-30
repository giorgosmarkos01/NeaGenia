import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/adminAuth";
import { listGroups } from "@/data/adminTaxonomy";

const CreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await listGroups();
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid name" },
      { status: 400 }
    );
  }
  const { name } = parsed.data;

  try {
    const [result]: any = await db.query(`INSERT INTO item_group (name) VALUES (?)`, [name]);
    return NextResponse.json({ id: result.insertId, name }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A group with that name already exists." },
        { status: 409 }
      );
    }
    console.error("[admin/groups] create error:", e);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
