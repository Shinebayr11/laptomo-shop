"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();

  if (lower.includes("password")) {
    return "Нууц үг шаардлага хангахгүй байна. Дор хаяж 6 тэмдэгттэй нууц үг оруулна уу.";
  }
  if (lower.includes("нэрээр бүртгэл") || lower.includes("profiles_name_unique")) {
    return "Энэ нэрээр бүртгэл үүссэн байна. Өөр нэр сонгоно уу.";
  }
  if (lower.includes("profile_name_exists")) {
    return "Supabase schema шинэчлэгдээгүй байна. profile_name_exists SQL function-ийг ажиллуулах шаардлагатай.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "Энэ имэйлээр бүртгэл үүссэн байна. Нэвтрэх хэсгээр орно уу.";
  }
  if (lower.includes("signup") && lower.includes("disabled")) {
    return "Supabase дээр шинэ хэрэглэгч бүртгэх тохиргоо хаалттай байна.";
  }
  if (lower.includes("email confirmation")) {
    return "Supabase дээр Confirm email асаалтгүй байна. Authentication > Providers > Email хэсгээс Confirm email-ийг асаана уу.";
  }
  if (lower.includes("redirect")) {
    return "Supabase redirect URL тохиргоо дутуу байна. /auth/callback URL-ийг зөвшөөрсөн эсэхийг шалгана уу.";
  }
  if (message) return message;

  return "Алдаа гарлаа. Мэдээллээ шалгана уу.";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const isLogin = mode === "login";

  const submit = async () => {
    setErr("");
    setNotice("");
    if (!isLogin && !name.trim()) {
      setErr("Нэрээ оруулна уу.");
      return;
    }
    if (!isLogin && password.length < 6) {
      setErr("Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.");
      return;
    }
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const result = await register(name, email, password);
        if (result.needsEmailConfirmation) {
          setNotice("Баталгаажуулах холбоос таны имэйл рүү илгээгдлээ. Имэйлээ шалгаад баталгаажуулсны дараа нэвтэрнэ үү.");
          return;
        }
      }
      router.push("/account");
    } catch (error) {
      setErr(authErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tightest text-ink">{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</h1>
      <p className="mb-8 text-sm text-muted">{isLogin ? "Бүртгэлдээ нэвтэрнэ үү." : "Шинэ бүртгэл үүсгэнэ үү."}</p>

      <div className="space-y-4">
        {!isLogin && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Имэйл" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Нууц үг" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
        {notice && <p className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-ink">{notice}</p>}
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Button onClick={submit} size="lg" className="w-full">{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "Бүртгэлгүй юу? " : "Бүртгэлтэй юу? "}
        <Link href={isLogin ? "/register" : "/login"} className="text-accent hover:underline">{isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}</Link>
      </p>
    </div>
  );
}
