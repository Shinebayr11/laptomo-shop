import { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminProvider } from "@/store/AdminContext";

export const metadata = { title: "Админ" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminProvider>
        <div className="mx-auto grid w-full max-w-[1440px] items-start gap-6 px-5 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-10">
          <AdminSidebar />
          <div className="page-enter min-w-0">{children}</div>
        </div>
      </AdminProvider>
    </AdminGuard>
  );
}
