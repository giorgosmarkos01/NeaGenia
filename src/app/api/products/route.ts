import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM item ORDER BY created_at DESC"
    );
    console.log("DB rows:", rows); // <--- Δες τι γυρνάει
    return NextResponse.json(rows);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
