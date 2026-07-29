"use client";
import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { AppUser, UserRole } from "@/types";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

/**
 * Session-ийг хуудас ачаалалт тутамд нэг л удаа шалгана. useAuth-ийг олон
 * component дууддаг тул module-level хамгаалалт хийхгүй бол давхардана.
 * useLocalStorage нь event-ээр бүх instance-ыг синк хийдэг тул нэг шалгалт хангалттай.
 */
let sessionVerified = false;
/** login/logout болсныг тэмдэглэнэ — шалгалт нь шинэ төлөвийг дарж болохгүй. */
let authRevision = 0;

export function useAuth() {
  const [user, setUser, ready] = useLocalStorage<AppUser | null>(
    "laptomo_user",
    null,
  );

  /**
   * localStorage дахь хэрэглэгчийг жинхэнэ Supabase session-тэй тулгана.
   * Session дуусах эсвэл localStorage-ийг гараар өөрчлөх үед "нэвтэрсэн" мэт
   * үлдэж, redirect loop үүсгэдэг байсныг үүгээр таслана.
   */
  useEffect(() => {
    if (!isSupabaseEnabled || !ready || sessionVerified) return;
    sessionVerified = true;

    let active = true;
    const revision = authRevision;
    void (async () => {
      try {
        const { data } = await createClient()!.auth.getSession();
        // Шалгаж байх хооронд нэвтэрсэн бол үр дүнг нь хэрэглэхгүй.
        if (active && revision === authRevision && !data.session) setUser(null);
      } catch {
        /* сүлжээний алдаанд хадгалсан төлөвийг хөндөхгүй */
      }
    })();

    return () => {
      active = false;
    };
  }, [ready, setUser]);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseEnabled) {
      try {
        const sb = createClient();
        const { data, error } = await sb!.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          authRevision += 1;
          const { data: profile } = await sb!
            .from("profiles")
            .select("role, name")
            .eq("id", data.user.id)
            .single();
          setUser({
            id: data.user.id,
            email: cleanEmail,
            name: profile?.name || cleanEmail.split("@")[0],
            role: (profile?.role as UserRole) ?? "customer",
          });
        }
      } catch (error) {
        setUser(null);
        throw normalizeSupabaseError(error);
      }
      return;
    }
    setUser({
      id: "demo",
      email: cleanEmail,
      name: cleanEmail.split("@")[0],
      role: cleanEmail.startsWith("admin") ? "admin" : "customer",
    });
  };

  const register = async (name: string, email: string, password: string) => {
    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName) throw new Error("Нэрээ оруулна уу.");

    if (isSupabaseEnabled) {
      try {
        const sb = createClient();
        const { data: nameExists, error: nameCheckError } = await sb!.rpc(
          "profile_name_exists",
          { check_name: cleanName },
        );

        if (nameCheckError) throw nameCheckError;
        if (nameExists) throw new Error("Энэ нэрээр бүртгэл үүссэн байна.");

        const emailRedirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined;
        const { data, error } = await sb!.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: cleanName }, emailRedirectTo },
        });
        if (error) throw error;
        if (data.session) {
          await sb!.auth.signOut();
          setUser(null);
          throw new Error(
            "Supabase дээр email confirmation асаалтгүй байна. Authentication > Providers > Email хэсгээс Confirm email-ийг асаана уу.",
          );
        }
      } catch (error) {
        throw normalizeSupabaseError(error);
      }
      return { needsEmailConfirmation: true };
    }
    setUser({
      id: "demo",
      email: cleanEmail,
      name: cleanName,
      role: "customer",
    });
    return { needsEmailConfirmation: false };
  };

  const logout = async () => {
    if (isSupabaseEnabled) {
      try {
        await createClient()!.auth.signOut();
      } catch {
        /* local session-ийг цэвэрлэх нь хангалттай */
      }
    }
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseEnabled) {
      throw new Error(
        "Нууц үг сэргээхэд Supabase холболт шаардлагатай байна.",
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            "/reset-password",
          )}`
        : undefined;

    try {
      const { error } = await createClient()!.auth.resetPasswordForEmail(
        cleanEmail,
        { redirectTo },
      );
      if (error) throw error;
    } catch (error) {
      throw normalizeSupabaseError(error);
    }
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseEnabled) {
      throw new Error(
        "Нууц үг шинэчлэхэд Supabase холболт шаардлагатай байна.",
      );
    }

    try {
      const supabase = createClient()!;
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error("Auth session missing");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setUser(null);

      await Promise.race([
        supabase.auth.signOut({ scope: "local" }),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ]);
    } catch (error) {
      throw normalizeSupabaseError(error);
    }
  };

  return {
    user,
    ready,
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    isAdmin: user?.role === "admin",
  };
}
