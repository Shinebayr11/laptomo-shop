"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "./PasswordInput";

function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();

  if (lower.includes("password")) {
    return "Нууц үг шаардлага хангахгүй байна. Дор хаяж 6 тэмдэгттэй нууц үг оруулна уу.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Имэйл эсвэл нууц үг буруу байна.";
  }
  if (lower.includes("email not confirmed")) {
    return "Имэйлээ баталгаажуулаагүй байна. Имэйл дээр ирсэн холбоосоор баталгаажуулсны дараа нэвтэрнэ үү.";
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

export function AuthForm({
  mode,
  nextPath,
  initialNotice = "",
}: {
  mode: "login" | "register";
  nextPath?: string;
  initialNotice?: string;
}) {
  const router = useRouter();
  const { user, ready, isAdmin, login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";
  const requestedPath =
    nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;
  // Нэвтэрсний дараа нүүр хуудас руу. Хэрэглэгч захиалгаа хармаар байвал
  // өөрөө профайл руугаа орно — шууд тэнд хаях нь дэлгүүр үзэхэд саад болдог.
  const customerDestination = requestedPath ?? "/";
  // Хэрэглэгч тодорхой хуудас руу явахаар нэвтэрсэн бол админ ч гэсэн тэндээ очно.
  const destination = requestedPath ?? (isAdmin ? "/admin" : "/");

  useEffect(() => {
    if (ready && user) {
      router.replace(destination);
    }
  }, [ready, user, destination, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErr("");
    setNotice("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErr("Имэйл болон нууц үгээ оруулна уу.");
      return;
    }
    if (!isLogin && !name.trim()) {
      setErr("Нэрээ оруулна уу.");
      return;
    }
    if (!isLogin && password.length < 6) {
      setErr("Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.");
      return;
    }
    setBusy(true);
    try {
      if (isLogin) {
        await login(cleanEmail, password);
      } else {
        const result = await register(name, cleanEmail, password);
        if (result.needsEmailConfirmation) {
          setNotice("Баталгаажуулах холбоос таны имэйл рүү илгээгдлээ. Имэйлээ шалгаад баталгаажуулсны дараа нэвтэрнэ үү.");
          return;
        }
      }
      // Эцсийн чиглүүлэлтийг дээрх effect хийнэ (role тодорхой болсны дараа).
      router.push(customerDestination);
    } catch (error) {
      setErr(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!ready || user) {
    return (
      <div className="mx-auto grid min-h-[420px] max-w-md place-items-center px-5 py-20 text-center">
        <p className="text-sm text-muted">Чиглүүлж байна...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tightest text-ink">{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</h1>
      <p className="mb-8 text-sm text-muted">{isLogin ? "Бүртгэлдээ нэвтэрнэ үү." : "Шинэ бүртгэл үүсгэнэ үү."}</p>

      <form onSubmit={submit} className="space-y-4">
        {!isLogin && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Имэйл" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
        <div>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="Нууц үг"
          />
          {isLogin && (
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                Нууц үгээ мартсан уу?
              </Link>
            </div>
          )}
        </div>
        {notice && <p className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-ink">{notice}</p>}
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Түр хүлээнэ үү..." : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "Бүртгэлгүй юу? " : "Бүртгэлтэй юу? "}
        <Link href={isLogin ? "/register" : "/login"} className="text-accent hover:underline">{isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}</Link>
      </p>
    </div>
  );
}
