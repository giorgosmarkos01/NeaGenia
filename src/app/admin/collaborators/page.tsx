import { listCollaborators } from "@/data/adminTaxonomy";
import SimpleEntityManager from "@/components/admin/SimpleEntityManager";

export const dynamic = "force-dynamic";

export default async function AdminCollaboratorsPage() {
  const collaborators = await listCollaborators();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Collaborators</h1>
      <SimpleEntityManager
        label="Collaborator"
        apiBasePath="/api/admin/collaborators"
        entities={collaborators}
      />
    </div>
  );
}
