import { getAdminSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { brandTitle } from "@/lib/brand";

export const metadata = {
  title: brandTitle("Admin"),
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const session = await getAdminSession();
  return <AdminShell admin={session}>{children}</AdminShell>;
}
