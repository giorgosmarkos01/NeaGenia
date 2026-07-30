import { listGroups } from "@/data/adminTaxonomy";
import SimpleEntityManager from "@/components/admin/SimpleEntityManager";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const groups = await listGroups();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Groups</h1>
      <SimpleEntityManager
        label="Group"
        apiBasePath="/api/admin/groups"
        entities={groups}
      />
    </div>
  );
}
