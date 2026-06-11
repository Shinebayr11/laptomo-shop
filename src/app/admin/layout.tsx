import { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminProvider } from "@/store/AdminContext";

export const metadata = { title: "Админ" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminProvider>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[230px_1fr] lg:px-8">
          <AdminSidebar />
          <div className="page-enter min-w-0">{children}</div>
        </div>
      </AdminProvider>
    </AdminGuard>
  );
}
