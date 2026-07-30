import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export type TaxonomyEntry = {
  id: number;
  name: string;
  productCount: number;
};

export async function listCategories(): Promise<TaxonomyEntry[]> {
  return queryRows<TaxonomyEntry & RowDataPacket>(
    `
    SELECT c.id, c.name, COUNT(i.id) AS productCount
    FROM category c
    LEFT JOIN item i ON i.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
    `
  );
}

export async function listGroups(): Promise<TaxonomyEntry[]> {
  return queryRows<TaxonomyEntry & RowDataPacket>(
    `
    SELECT g.id, g.name, COUNT(i.id) AS productCount
    FROM item_group g
    LEFT JOIN item i ON i.group_id = g.id
    GROUP BY g.id, g.name
    ORDER BY g.name ASC
    `
  );
}

export async function listCollaborators(): Promise<TaxonomyEntry[]> {
  return queryRows<TaxonomyEntry & RowDataPacket>(
    `
    SELECT co.id, co.name, COUNT(i.id) AS productCount
    FROM collaborator co
    LEFT JOIN item i ON i.collaborator_id = co.id
    GROUP BY co.id, co.name
    ORDER BY co.name ASC
    `
  );
}
