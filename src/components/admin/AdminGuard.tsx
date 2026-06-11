"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, ready, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && (!user || !isAdmin)) router.push("/login");
  }, [ready, user, isAdmin, router]);

  if (!ready) return null;
  if (!user || !isAdmin)
    return (
      <div className="grid place-items-center py-32 text-center">
        <p className="text-sm text-muted">Зөвхөн админ нэвтрэх боломжтой. Чиглүүлж байна...</p>
      </div>
    );
  return <>{children}</>;
}
