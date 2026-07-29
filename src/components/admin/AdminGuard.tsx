"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";

type AccessState = "checking" | "allowed" | "denied";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    // Supabase унтраалттай demo горимд localStorage дээрх role-оор ажиллана.
    if (!isSupabaseEnabled) {
      if (!ready) return;
      setAccess(user && isAdmin ? "allowed" : "denied");
      return;
    }

    let active = true;

    const verify = async () => {
      try {
        const supabase = createClient()!;
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();

        if (!sessionUser) {
          if (active) setAccess("denied");
          return;
        }

        // Role-ийг localStorage-оос биш, DB-ээс уншина.
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .single();

        if (active) {
          setAccess(!error && profile?.role === "admin" ? "allowed" : "denied");
        }
      } catch {
        if (active) setAccess("denied");
      }
    };

    void verify();
    return () => {
      active = false;
    };
  }, [ready, user, isAdmin]);

  useEffect(() => {
    if (access === "denied") router.replace("/login?next=/admin");
  }, [access, router]);

  if (access === "checking") return null;
  if (access === "denied")
    return (
      <div className="grid place-items-center py-32 text-center">
        <p className="text-sm text-muted">Зөвхөн админ нэвтрэх боломжтой. Чиглүүлж байна...</p>
      </div>
    );
  return <>{children}</>;
}
