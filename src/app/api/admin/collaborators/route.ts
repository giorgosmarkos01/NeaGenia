import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/adminAuth";
import { listCollaborators } from "@/data/adminTaxonomy";

const CreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const collaborators = await listCollaborators();
  return NextResponse.json({ collaborators });
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

  const [[existing]]: any = await db.query(
    `SELECT id FROM collaborator WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    [name]
  );
  if (existing) {
    return NextResponse.json(
      { error: "A collaborator with that name already exists." },
      { status: 409 }
    );
  }

  const [result]: any = await db.query(`INSERT INTO collaborator (name) VALUES (?)`, [name]);
  return NextResponse.json({ id: result.insertId, name }, { status: 201 });
}
