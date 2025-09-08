import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // παίρνει το [id] από το path

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const [rows]: any = await db.query("SELECT * FROM item WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
