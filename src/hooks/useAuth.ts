"use client";
import { useLocalStorage } from "./useLocalStorage";
import { AppUser, UserRole } from "@/types";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function useAuth() {
  const [user, setUser, ready] = useLocalStorage<AppUser | null>(
    "laptomo_user",
    null,
  );

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

  return {
    user,
    ready,
    login,
    register,
    logout,
    isAdmin: user?.role === "admin",
  };
}
