import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { isAdminEmail } from "@/lib/adminAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ToastProvider from "@/components/admin/ToastProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-black">
        <p className="text-lg font-medium">Sign in to access the admin panel.</p>
        <SignInButton mode="modal">
          <button className="rounded-lg bg-black px-6 py-3 font-bold text-white hover:bg-gray-800">
            Sign in
          </button>
        </SignInButton>
      </main>
    );
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  if (!isAdminEmail(email)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white text-black">
        <p className="text-lg font-medium">Access denied</p>
        <p className="text-sm text-zinc-600">
          {email} is not authorized to view the admin panel.
        </p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          Back to store
        </Link>
      </main>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-zinc-50 text-black md:flex-row flex-col">
        <AdminSidebar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
