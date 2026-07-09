"use client";
import { useLocalStorage } from "./useLocalStorage";
import { AppUser, UserRole } from "@/types";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";

/**
 * Supabase идэвхтэй бол жинхэнэ auth ашиглана.
 * Нэвтрэх үед profiles хүснэгтээс эрх (role)-ийг уншиж авна.
 * Үгүй бол demo горимоор localStorage дээр хэрэглэгч хадгална.
 */
export function useAuth() {
  const [user, setUser, ready] = useLocalStorage<AppUser | null>(
    "laptomo_user",
    null,
  );

  const login = async (email: string, password: string) => {
    if (isSupabaseEnabled) {
      const sb = createClient();
      const { data, error } = await sb!.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const { data: profile } = await sb!
          .from("profiles")
          .select("role, name")
          .eq("id", data.user.id)
          .single();
        setUser({
          id: data.user.id,
          email,
          name: profile?.name || email.split("@")[0],
          role: (profile?.role as UserRole) ?? "customer",
        });
      }
      return;
    }
    setUser({
      id: "demo",
      email,
      name: email.split("@")[0],
      role: email.startsWith("admin") ? "admin" : "customer",
    });
  };

  const register = async (name: string, email: string, password: string) => {
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!cleanName) throw new Error("Нэрээ оруулна уу.");

    if (isSupabaseEnabled) {
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
        email,
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
      return { needsEmailConfirmation: true };
    }
    setUser({ id: "demo", email, name: cleanName, role: "customer" });
    return { needsEmailConfirmation: false };
  };

  const logout = async () => {
    if (isSupabaseEnabled) await createClient()!.auth.signOut();
    setUser(null);
  };

  return {
    user,
    ready,
    login,
    register,
    logout,
    isAdmin: user?.role === "admin",
  };
}
