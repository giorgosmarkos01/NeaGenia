import { currentUser } from "@clerk/nextjs/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/**
 * Returns the signed-in Clerk user if they are on the ADMIN_EMAILS allowlist,
 * otherwise null. Use in server components/route handlers to gate /admin.
 */
export async function requireAdminUser() {
  const user = await currentUser();
  if (!user) return null;

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  if (!isAdminEmail(email)) return null;
  return user;
}
