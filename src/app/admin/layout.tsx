import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminProvider } from "@/store/AdminContext";
import { createServerSupabase, isSupabaseEnabled } from "@/lib/supabase/server";

export const metadata = { title: "Админ" };

/** Админ хэсэг session-ээс хамаардаг тул cache хийхгүй. */
export const dynamic = "force-dynamic";

/**
 * Server талын эрхийн шалгалт. localStorage-ийг гараар өөрчилж админ болох
 * оролдлогыг энд таслана — role нь зөвхөн DB-ээс уншигдана.
 */
async function assertAdmin() {
  if (!isSupabaseEnabled) return;

  const supabase = createServerSupabase()!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login?next=/admin");
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await assertAdmin();

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
