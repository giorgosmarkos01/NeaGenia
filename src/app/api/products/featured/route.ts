import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await db.query(
      "SELECT * FROM item ORDER BY RAND() LIMIT 5"
    );
    // Μετατρέπουμε RowDataPacket -> κανονικό array
    return NextResponse.json(JSON.parse(JSON.stringify(rows)));
  } catch (error) {
    console.error("FEATURED API ERROR:", error); // <
    console.error(error);
    return NextResponse.json([], { status: 500 }); // Επιστρέφει πάντα array
  }
}
