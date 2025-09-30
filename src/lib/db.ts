import mysql from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// SELECT helper: returns array of rows typed as R[]
export async function queryRows<R extends RowDataPacket>(
  sql: string,
  values?: any[]
): Promise<R[]> {
  const [rows] = await db.query<R[]>(sql, values);
  return rows;
}

// INSERT/UPDATE/DELETE helper: returns header (insertId, affectedRows, etc.)
export async function exec(
  sql: string,
  values?: any[]
): Promise<ResultSetHeader> {
  const [res] = await db.execute<ResultSetHeader>(sql, values);
  return res;
}
