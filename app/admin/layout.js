// app/admin/layout.js
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export const metadata = { title: "Admin Dashboard — COP-S" };

export default async function AdminLayout({ children }) {
  await requireAdmin(); // akan redirect ke /login jika bukan admin

  return (
    <div className="min-h-screen bg-night flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
